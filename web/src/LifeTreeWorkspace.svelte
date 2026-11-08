<script lang="ts">
  import type { Character, DecisionTreeId, DecisionTreeRecord, GameEventEffects } from './lib/types';
  let { character }: { character: Character } = $props();
  const trees: { id: DecisionTreeId; label: string; detail: string }[] = [
    { id: 'life', label: 'Life choices', detail: 'Personal opportunities and turning points' },
    { id: 'education', label: 'Education', detail: 'Learning paths and academic decisions' },
    { id: 'career', label: 'Career', detail: 'Work, ambition and professional direction' },
    { id: 'relationships', label: 'Relationships', detail: 'Family, friendships and connections' },
    { id: 'health', label: 'Health', detail: 'Wellbeing and recovery decisions' },
    { id: 'finance', label: 'Finance', detail: 'Money, saving and financial choices' }
  ];
  let activeTree = $state<DecisionTreeId>('life');
  const records = $derived((character.decisionTreeHistory ?? []).filter((item) => item.treeId === activeTree).slice().reverse());
  const totalDecisions = $derived((character.decisionTreeHistory ?? []).length);
  const statLabels: Record<string, string> = {
    health: 'Health', happiness: 'Happiness', intelligence: 'Intelligence', fitness: 'Fitness',
    stamina: 'Stamina', focus: 'Focus', confidence: 'Confidence', discipline: 'Discipline',
    creativity: 'Creativity', socialSkills: 'Social skills', stress: 'Stress'
  };
  function rewards(effects: GameEventEffects) {
    return Object.entries(effects).filter(([key, value]) => key !== 'money' && typeof value === 'number' && value !== 0)
      .map(([key, value]) => ({ label: statLabels[key] ?? key, value: value as number }));
  }
</script>

<section class="life-tree">
  <header class="tree-intro">
    <div><div class="eyebrow">YOUR STORY · DECISION MAP</div><h2>Life tree</h2><p>Every recorded choice becomes a node in your story. Follow the path you took, compare the alternatives, and see the abilities each route could develop.</p></div>
    <div class="tree-total"><strong>{totalDecisions}</strong><span>DECISIONS</span></div>
  </header>
  <nav class="tree-tabs" aria-label="Decision tree types">
    {#each trees as tree}
      <button class:active={activeTree === tree.id} onclick={() => activeTree = tree.id}>{tree.label}</button>
    {/each}
  </nav>
  <p class="tree-description">{trees.find((tree) => tree.id === activeTree)?.detail}</p>

  {#if records.length}
    <div class="tree-path">
      {#each records as record, index}
        <article class="decision-node">
          <div class="node-rail"><span class="node-marker">{records.length - index}</span>{#if index < records.length - 1}<span class="node-connector"></span>{/if}</div>
          <div class="node-content">
            <div class="node-meta"><span>AGE {record.age} · YEAR {record.year}</span><span class="node-status">DECISION RECORDED</span></div>
            <h3>{record.title}</h3>
            <p class="node-context">{record.description}</p>
            <div class="branch-list">
              {#each record.branches as branch}
                <div class:chosen={branch.choiceId === record.chosenChoiceId} class="branch-card">
                  <div class="branch-heading"><strong>{branch.label}</strong>{#if branch.choiceId === record.chosenChoiceId}<span class="chosen-tag">YOUR PATH</span>{:else}<span class="other-tag">ALTERNATIVE</span>{/if}</div>
                  <p>{branch.detail}</p>
                  <div class="branch-rewards">
                    {#if rewards(branch.rewards).length}
                      {#each rewards(branch.rewards) as reward}
                        <span class:negative={reward.value < 0}>{reward.label} {reward.value > 0 ? '+' : ''}{reward.value}</span>
                      {/each}
                    {:else}
                      <span class="no-reward">No direct attribute change</span>
                    {/if}
                    {#if branch.rewards.money}<span class:negative={branch.rewards.money < 0}>Money {branch.rewards.money > 0 ? '+' : ''}{branch.rewards.money}</span>{/if}
                  </div>
                  {#if branch.followUp}<div class="branch-followup"><span>LEADS TO</span><strong>{branch.followUp.title}</strong><small>{branch.followUp.description}</small></div>{/if}
                </div>
              {/each}
            </div>
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <div class="tree-empty"><div class="empty-glyph">⑂</div><h3>No decisions recorded yet</h3><p>When a decision in this part of life is resolved, its chosen route and alternative branches will appear here as a skill-tree node.</p></div>
  {/if}
</section>

<style>
  .life-tree{display:grid;gap:14px;min-width:0}
  .tree-intro{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:17px;border:1px solid var(--line);border-radius:15px;background:linear-gradient(145deg,var(--surface-raised),var(--surface))}
  .tree-intro>div:first-child{min-width:0}
  .tree-intro h2{margin:5px 0;color:var(--text);font-size:25px;letter-spacing:-.7px}
  .tree-intro p{max-width:620px;margin:0;color:var(--muted);font-size:12px;line-height:1.55}
  .tree-total{display:grid;justify-items:center;gap:3px;flex:none;min-width:65px;padding:9px;border:1px solid var(--line);border-radius:11px;background:var(--surface)}
  .tree-total strong{font-size:23px;color:var(--accent);font-variant-numeric:tabular-nums}
  .tree-total span,.node-meta,.chosen-tag,.other-tag,.branch-followup>span{font-size:8px;font-weight:800;letter-spacing:.8px}
  .tree-total span{color:var(--muted)}
  .tree-tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 0 7px;scrollbar-width:thin}
  .tree-tabs button{flex:none;min-height:39px;padding:0 12px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--muted);font-size:10px;font-weight:700;white-space:nowrap}
  .tree-tabs button.active{border-color:rgba(114,214,154,.5);background:var(--accent-soft);color:var(--accent)}
  .tree-description{margin:-8px 0 0;color:var(--muted);font-size:10px}
  .tree-path{display:grid;gap:0}
  .decision-node{display:grid;grid-template-columns:34px minmax(0,1fr);gap:9px}
  .node-rail{display:flex;flex-direction:column;align-items:center}
  .node-marker{display:grid;place-items:center;width:28px;height:28px;border:1px solid rgba(114,214,154,.55);border-radius:50%;background:var(--accent-soft);color:var(--accent);font-size:10px;font-weight:800}
  .node-connector{flex:1;width:2px;min-height:18px;background:linear-gradient(var(--accent),var(--line-strong))}
  .node-content{min-width:0;margin-bottom:14px;padding:13px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}
  .node-meta{display:flex;justify-content:space-between;gap:8px;color:var(--muted)}
  .node-status{color:var(--accent)}
  .node-content h3{margin:7px 0 4px;color:var(--text);font-size:14px}
  .node-context{margin:0 0 11px;color:var(--muted);font-size:10px;line-height:1.5}
  .branch-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
  .branch-card{min-width:0;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised)}
  .branch-card.chosen{border-color:rgba(114,214,154,.55);background:var(--accent-soft)}
  .branch-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:6px}
  .branch-heading strong{color:var(--text);font-size:11px}
  .chosen-tag{flex:none;color:var(--accent)}
  .other-tag{flex:none;color:var(--muted)}
  .branch-card>p{margin:6px 0 8px;color:var(--muted);font-size:9px;line-height:1.45}
  .branch-rewards{display:flex;flex-wrap:wrap;gap:4px}
  .branch-rewards span{padding:4px 6px;border-radius:6px;background:var(--surface);color:var(--accent);font-size:8px;font-weight:750}
  .branch-rewards span.negative{color:var(--danger,var(--muted))}
  .branch-rewards .no-reward{color:var(--muted)}
  .branch-followup{display:grid;gap:3px;margin-top:8px;padding-top:7px;border-top:1px solid var(--line)}
  .branch-followup>span{color:var(--accent)}
  .branch-followup strong{color:var(--text);font-size:9px}
  .branch-followup small{color:var(--muted);font-size:9px;line-height:1.4}
  .tree-empty{display:grid;justify-items:center;gap:7px;padding:35px 20px;border:1px dashed var(--line-strong);border-radius:14px;text-align:center}
  .empty-glyph{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--accent-soft);color:var(--accent);font-size:24px}
  .tree-empty h3{margin:4px 0 0;color:var(--text);font-size:14px}
  .tree-empty p{max-width:390px;margin:0;color:var(--muted);font-size:10px;line-height:1.55}
  @media(max-width:520px){.tree-intro{padding:13px}.tree-intro h2{font-size:22px}.tree-intro p{font-size:10px}.branch-list{grid-template-columns:1fr}.node-content{padding:10px}.node-meta{font-size:7px}}
</style>
