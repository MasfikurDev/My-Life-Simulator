<script lang="ts">
  import type { Character } from './lib/types';
  import { getEducationTree, type EducationTreeNode } from './lib/education-tree';

  let { character }: { character: Character } = $props();
  let selectedNodeId = $state('');
  const tree = $derived(getEducationTree(character));
  const selectedNode = $derived(
    tree.nodes.find((node) => node.id === selectedNodeId) ??
    tree.nodes.find((node) => node.status === 'current') ??
    tree.nodes.find((node) => node.status === 'available') ??
    tree.nodes[0]
  );
  const completedCount = $derived(tree.nodes.filter((node) => node.status === 'completed').length);
  const availableCount = $derived(tree.nodes.filter((node) => node.status === 'available').length);
  const currentCount = $derived(tree.nodes.filter((node) => node.status === 'current').length);
  const selectedSubjects = $derived(character.educationEnrollment?.programId === selectedNode?.programId ? character.educationEnrollment.subjects : []);

  function edgePath(from: EducationTreeNode, to: EducationTreeNode) {
    const startY = from.y + (from.kind === 'subject' ? 25 : 32);
    const endY = to.y - 32;
    const middleY = (startY + endY) / 2;
    return `M ${from.x} ${startY} C ${from.x} ${middleY}, ${to.x} ${middleY}, ${to.x} ${endY}`;
  }
  function shortTitle(title: string) {
    return title.replace('Programme', '').replace('programme', '').replace('school', 'School');
  }
  function nodeSymbol(node: EducationTreeNode) {
    if (node.kind === 'subject') return '✦';
    if (node.status === 'completed') return '✓';
    if (node.status === 'locked') return '⌑';
    if (node.status === 'current') return '◉';
    return node.programId?.includes('degree') ? '◇' : node.programId?.includes('vocational') ? '⚒' : '✧';
  }
  function nodeStatusLabel(status: EducationTreeNode['status']) {
    return status === 'current' ? 'IN PROGRESS' : status.toUpperCase();
  }
</script>

<section class="education-tree">
  <div class="tree-summary">
    <div class="tree-summary-copy">
      <span class="eyebrow">LIVE PROGRESSION · EDUCATION</span>
      <strong>Learning pathways</strong>
      <small>Routes update from your age, education history, current programme and entry requirements.</small>
    </div>
    <div class="tree-counts">
      <span><b>{completedCount}</b> done</span>
      <span><b>{currentCount}</b> active</span>
      <span><b>{availableCount}</b> open</span>
    </div>
  </div>

  <div class="tree-legend" aria-label="Tree node states">
    <span><i class="completed"></i>Completed</span>
    <span><i class="current"></i>Current</span>
    <span><i class="available"></i>Available</span>
    <span><i class="locked"></i>Locked</span>
  </div>

  <div class="tree-canvas" aria-label="Education progression tree">
    <svg class="tree-connections" viewBox="0 0 360 1000" preserveAspectRatio="none" aria-hidden="true">
      {#each tree.edges as edge}
        {@const from = tree.nodes.find((node) => node.id === edge.from)}
        {@const to = tree.nodes.find((node) => node.id === edge.to)}
        {#if from && to}
          <path class:optional={edge.style !== 'required'} class:completed={from.status === 'completed' && to.status === 'completed'} d={edgePath(from, to)} />
        {/if}
      {/each}
    </svg>
    {#each tree.nodes as node (node.id)}
      <button
        class="tree-node"
        class:selected={selectedNode?.id === node.id}
        class:completed={node.status === 'completed'}
        class:current={node.status === 'current'}
        class:available={node.status === 'available'}
        class:locked={node.status === 'locked'}
        style:left={`${node.x / 360 * 100}%`}
        style:top={`${node.y / 1000 * 100}%`}
        aria-pressed={selectedNode?.id === node.id}
        aria-label={`${node.title}, ${nodeStatusLabel(node.status)}`}
        onclick={() => selectedNodeId = node.id}
      >
        <span class="node-orb" style={`--node-progress:${node.progress * 3.6}deg`}>
          <span class="node-core">{nodeSymbol(node)}</span>
        </span>
        <span class="node-title">{shortTitle(node.title)}</span>
        <span class="node-state">{node.kind === 'subject' ? `${node.progress}%` : nodeStatusLabel(node.status)}</span>
      </button>
    {/each}
  </div>

  {#if selectedNode}
    <section class="node-details" aria-live="polite">
      <div class="detail-heading">
        <div>
          <span class="eyebrow">{selectedNode.kind === 'subject' ? 'SUBJECT PROGRESS' : 'PATHWAY DETAILS'}</span>
          <h3>{selectedNode.title}</h3>
          <p>{selectedNode.subtitle}</p>
        </div>
        <span class="detail-state" class:done={selectedNode.status === 'completed'} class:open={selectedNode.status === 'available'} class:active={selectedNode.status === 'current'}>{nodeStatusLabel(selectedNode.status)}</span>
      </div>
      {#if selectedNode.kind === 'programme'}
        <div class="detail-facts">
          {#if selectedNode.field}<span>Field <b>{selectedNode.field}</b></span>{/if}
          {#if selectedNode.progress > 0}<span>Progress <b>{selectedNode.progress}%</b></span>{/if}
          {#if selectedNode.durationWeeks}<span>Duration <b>{selectedNode.durationWeeks} weeks</b></span>{/if}
          {#if selectedNode.ageRange}<span>Age range <b>{selectedNode.ageRange}</b></span>{/if}
          {#if selectedNode.tuition !== undefined}<span>Tuition <b>{selectedNode.tuition ? selectedNode.tuition.toLocaleString() : 'Free'}</b></span>{/if}
        </div>
      {:else}
        <div class="detail-progress"><span>Current grade</span><b>{selectedNode.progress}%</b></div>
      {/if}
      <p class="detail-reason">{selectedNode.reason}</p>
      {#if selectedSubjects.length}
        <div class="subject-nodes" aria-label="Current subject progress">
          {#each selectedSubjects as subject}
            <div class="subject-node" style={`--subject-progress:${Math.max(0, Math.min(100, subject.grade)) * 3.6}deg`}>
              <span class="subject-orb">{Math.round(subject.grade)}</span>
              <strong>{subject.name}</strong>
            </div>
          {/each}
        </div>
      {/if}
      {#if selectedNode.status === 'available' && selectedNode.kind === 'programme'}
        <p class="detail-action">This route is open. Enrolment and programme selection remain in the Education workspace.</p>
      {:else if selectedNode.status === 'locked'}
        <p class="detail-action">Meet the requirement to unlock this route. Other independent routes may still be available.</p>
      {/if}
    </section>
  {/if}
  <p class="tree-note">Connections show programme prerequisites. Independent certificates and vocational routes are separate options, not mandatory steps in a single academic chain.</p>
</section>

<style lang="scss">
  .education-tree{display:grid;gap:12px;min-width:0}
  .tree-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}
  .tree-summary-copy{display:grid;gap:4px;min-width:0}
  .eyebrow{color:var(--muted);font-size:9px;font-weight:800;letter-spacing:.8px}
  .tree-summary-copy strong{color:var(--text);font-size:15px}
  .tree-summary-copy small{max-width:390px;color:var(--muted);font-size:10px;line-height:1.45}
  .tree-counts{display:grid;gap:4px;flex:none;color:var(--muted);font-size:9px;text-align:right}
  .tree-counts b{color:var(--text);font-variant-numeric:tabular-nums}
  .tree-legend{display:flex;flex-wrap:wrap;gap:10px;padding:0 3px}
  .tree-legend span{display:flex;align-items:center;gap:5px;color:var(--muted);font-size:9px}
  .tree-legend i{width:7px;height:7px;border-radius:50%;background:var(--line-strong)}
  .tree-legend i.completed{background:var(--success)}
  .tree-legend i.current{background:var(--accent)}
  .tree-legend i.available{background:var(--info)}
  .tree-legend i.locked{background:var(--muted)}
  .tree-canvas{position:relative;width:100%;max-width:560px;aspect-ratio:360/1000;margin:0 auto;overflow:visible}
  .tree-connections{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
  .tree-connections path{fill:none;stroke:var(--line-strong);stroke-width:2.2;stroke-linecap:round;opacity:.85}
  .tree-connections path.optional{stroke-dasharray:4 6;opacity:.55}
  .tree-connections path.completed{stroke:var(--success);opacity:.8}
  .tree-node{position:absolute;display:grid;justify-items:center;gap:3px;width:94px;padding:0;border:0;background:transparent;color:var(--text);text-align:center;transform:translate(-50%,-50%);cursor:pointer}
  .node-orb{display:grid;place-items:center;width:62px;height:62px;padding:4px;border-radius:50%;background:conic-gradient(var(--node-color) var(--node-progress),var(--line) 0);transition:transform .18s,filter .18s}
  .node-core{display:grid;place-items:center;width:100%;height:100%;border:1px solid color-mix(in srgb,var(--node-color) 65%,var(--line));border-radius:50%;background:var(--surface-raised);color:var(--node-color);font-size:23px;font-weight:800;box-shadow:inset 0 0 0 3px var(--surface)}
  .tree-node:hover .node-orb,.tree-node.selected .node-orb{transform:scale(1.08);filter:brightness(1.16)}
  .tree-node.selected .node-core{box-shadow:inset 0 0 0 3px var(--surface),0 0 0 2px var(--node-color)}
  .tree-node.completed{--node-color:var(--success);--node-progress:360deg}
  .tree-node.current{--node-color:var(--accent)}
  .tree-node.available{--node-color:var(--info);--node-progress:0deg}
  .tree-node.locked{--node-color:var(--muted);--node-progress:0deg;opacity:.68}
  .node-title{max-width:94px;color:var(--text);font-size:9px;font-weight:750;line-height:1.2;text-wrap:balance}
  .node-state{color:var(--node-color);font-size:7px;font-weight:850;letter-spacing:.45px}
  .node-details{display:grid;gap:10px;padding:14px;border:1px solid var(--line-strong);border-radius:13px;background:var(--surface)}
  .detail-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
  .detail-heading h3{margin:4px 0 2px;color:var(--text);font-size:15px}
  .detail-heading p{margin:0;color:var(--muted);font-size:10px}
  .detail-state{flex:none;padding:5px 7px;border:1px solid var(--line);border-radius:7px;color:var(--muted);font-size:8px;font-weight:800}
  .detail-state.done{color:var(--success)}
  .detail-state.open{color:var(--info)}
  .detail-state.active{color:var(--accent)}
  .detail-facts{display:flex;flex-wrap:wrap;gap:7px}
  .detail-facts span{display:grid;gap:3px;min-width:90px;padding:7px 9px;border-radius:8px;background:var(--surface-raised);color:var(--muted);font-size:8px}
  .detail-facts b{color:var(--text);font-size:10px}
  .subject-nodes{display:flex;flex-wrap:wrap;gap:12px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised)}
  .subject-node{display:grid;justify-items:center;gap:5px;width:76px;text-align:center}
  .subject-orb{display:grid;place-items:center;width:42px;height:42px;border:3px solid var(--accent);border-radius:50%;background:var(--surface);color:var(--text);font-size:10px;font-weight:850;box-shadow:inset 0 0 0 3px var(--surface-raised)}
  .subject-node strong{color:var(--muted);font-size:8px;line-height:1.25}
  .detail-progress{display:flex;justify-content:space-between;color:var(--muted);font-size:10px}
  .detail-progress b{color:var(--accent)}
  .detail-reason{margin:0;color:var(--text);font-size:11px}
  .detail-action{margin:0;padding-top:8px;border-top:1px solid var(--line);color:var(--muted);font-size:10px;line-height:1.45}
  .tree-note{margin:0;color:var(--muted);font-size:9px;line-height:1.5}
  @media(max-width:420px){.tree-summary{align-items:flex-start}.tree-summary-copy small{max-width:230px}.tree-node{width:84px}.node-orb{width:56px;height:56px}.node-title{max-width:84px;font-size:8px}}
</style>
