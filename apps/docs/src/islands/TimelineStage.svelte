<!--
  The app around one timeline block, as a consumer would write it: the block
  is controlled and holds no clock, so this keeps the time, the playing and
  loop flags, the tracks and the selection, and writes back every change the
  block reports. While playing, a requestAnimationFrame clock advances the
  time; at the end it stops, or wraps round to the start when looping.
-->
<script lang="ts">
  import Timeline from "../../../../registry/blocks/timeline/svelte/Timeline.svelte";

  interface Track {
    id: string;
    label: string;
    keyframes: { id: string; time: number }[];
  }

  let {
    tracks: initialTracks,
    duration,
    fps = 30,
    time: startTime = 0,
  }: { tracks: Track[]; duration: number; fps?: number; time?: number } = $props();

  // Seeded once from the props: from here on the demo owns them, like an app would.
  // svelte-ignore state_referenced_locally
  let tracks = $state(initialTracks);
  // svelte-ignore state_referenced_locally
  let time = $state(startTime);
  let playing = $state(false);
  let loop = $state(false);
  let selectedKeyframe = $state<{ trackId: string; keyframeId: string } | null>(null);

  $effect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const next = time + (now - last) / 1000;
      last = now;
      if (next < duration) {
        time = next;
      } else if (loop) {
        time = next % duration;
      } else {
        time = duration;
        playing = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  });

  function play(next: boolean) {
    // Play from the start once the end is reached, as a media player does.
    if (next && time >= duration) time = 0;
    playing = next;
  }

  function moveKeyframe(change: { trackId: string; keyframeId: string; time: number }) {
    tracks = tracks.map((track) =>
      track.id !== change.trackId
        ? track
        : {
            ...track,
            keyframes: track.keyframes.map((keyframe) =>
              keyframe.id === change.keyframeId ? { ...keyframe, time: change.time } : keyframe,
            ),
          },
    );
  }
</script>

<Timeline
  {tracks}
  {duration}
  {fps}
  {time}
  {playing}
  {loop}
  {selectedKeyframe}
  ontimechange={(next) => (time = next)}
  onplayingchange={play}
  onloopchange={(next) => (loop = next)}
  onkeyframeselect={(selection) => (selectedKeyframe = selection)}
  onkeyframechange={moveKeyframe}
/>
