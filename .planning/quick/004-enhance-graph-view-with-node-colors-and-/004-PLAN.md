---
quick: "004"
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/graph/ForceGraph.tsx
autonomous: true

must_haves:
  truths:
    - "Tag nodes and note nodes are visually distinct via different colors"
    - "Graph automatically zooms to fit all nodes on initial view"
    - "Colors remain consistent with Nord theme"
  artifacts:
    - path: "apps/web/src/components/graph/ForceGraph.tsx"
      provides: "Enhanced color scheme and auto-zoom functionality"
      min_lines: 200
  key_links:
    - from: "ForceGraph.tsx"
      to: "zoomToFit method"
      via: "useEffect hook calling fgRef.current.zoomToFit()"
      pattern: "fgRef\\.current.*zoomToFit"
---

<objective>
Enhance the graph view with visual distinction between tag and note nodes using different color schemes, and implement automatic zoom-to-fit on initial load for better user experience.

Purpose: Improve graph readability by making node types immediately distinguishable and ensuring users see the full graph context without manual zooming.
Output: Updated ForceGraph component with distinct node colors and auto-zoom behavior.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@./apps/web/src/components/graph/ForceGraph.tsx
@./apps/web/src/hooks/useGraphData.ts

**Current Implementation:**
- ForceGraph.tsx already has color definitions in COLORS object (lines 26-40)
- Tag nodes use `#b48ead` (purple) and note nodes use `#88c0d0` (blue/frost)
- The paintNode function already applies these colors based on node type
- react-force-graph-2d exposes `zoomToFit()` method via ForceGraphMethods ref
- Physics setup happens in useEffect (lines 56-63)

**What Needs Enhancement:**
1. Colors are already defined but may need adjustment for better distinction
2. Auto-zoom needs to be added to existing physics setup useEffect
</context>

<tasks>

<task type="auto">
  <name>Enhance color distinction and add auto-zoom to graph view</name>
  <files>apps/web/src/components/graph/ForceGraph.tsx</files>
  <action>
1. Review and potentially enhance the color contrast between tag and note nodes in the COLORS object (lines 26-40):
   - Tag nodes currently use `#b48ead` (purple/aurora)
   - Note nodes currently use `#88c0d0` (blue/frost)
   - Ensure sufficient visual distinction while maintaining Nord theme consistency
   - Consider making tag nodes more prominent (they are hub nodes connecting multiple notes)

2. Add auto-zoom functionality to the existing physics setup useEffect (after line 63):
   - After configuring d3Force settings, call `fgRef.current.zoomToFit()`
   - Use appropriate parameters: `zoomToFit(durationMs?, padding?, nodeFilter?)`
   - Recommended: 400ms duration, 50-100px padding for breathing room
   - Add a small delay (setTimeout 100-200ms) to ensure graph is rendered before zoom
   - Example: `setTimeout(() => fgRef.current?.zoomToFit(400, 80), 200)`

3. Ensure the auto-zoom only runs once on initial mount, not on every data change:
   - Use a ref or state flag to track if initial zoom has occurred
   - Or make the dependency array of useEffect empty `[]` if only initial zoom is needed
   - Current useEffect has `[]` dependencies, which is correct for one-time setup

4. Test that colors are visually distinct and zoom shows all nodes with appropriate padding.
  </action>
  <verify>
1. Run dev server: `pnpm dev`
2. Navigate to graph view at http://localhost:5173/graph
3. Verify tag nodes and note nodes have distinct, easily distinguishable colors
4. Verify graph automatically zooms to show all nodes with padding on initial load
5. Verify zoom animation is smooth and completes within ~400ms
6. Check browser console for any errors
  </verify>
  <done>
- Tag nodes and note nodes use clearly distinct colors within Nord theme
- Graph view automatically zooms to fit all nodes with padding on initial load
- Animation is smooth and does not re-trigger on hover/interaction
- No console errors or TypeScript issues
  </done>
</task>

</tasks>

<verification>
**Visual Check:**
- Open graph view and confirm tag nodes (purple/aurora) are visually distinct from note nodes (blue/frost)
- Confirm all nodes are visible on initial load without manual panning/zooming
- Confirm adequate padding around the graph boundaries

**Interaction Check:**
- Hover over nodes to ensure colors still respond correctly
- Click nodes to verify highlighting still works
- Pan and zoom manually to ensure controls still function properly

**Code Quality:**
- No TypeScript errors
- Colors maintain Nord theme consistency
- Auto-zoom only executes once on mount
</verification>

<success_criteria>
- Tag and note nodes are immediately distinguishable by color
- Graph automatically fits all nodes in view on initial load with comfortable padding
- Existing hover/highlight/interaction behaviors remain intact
- No degradation in graph performance or responsiveness
</success_criteria>

<output>
After completion, create `.planning/quick/004-enhance-graph-view-with-node-colors-and-/004-SUMMARY.md`
</output>
