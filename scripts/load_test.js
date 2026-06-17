import fetch from 'node-fetch';

async function performLoadTest() {
  console.log("🚀 Starting Concurrent Load Testing...\n");
  
  // We will hit the local dev server or production server. 
  // For safety, we hit local dev if it's running, or mock the latency.
  // Since we might not have the dev server running during this script execution,
  // we will simulate the exact async boundaries of the /api/chat route:
  // 1. Rewrite Query (Gemini Call) ~ 600ms
  // 2. Embed Query (Gemini Call) ~ 300ms
  // 3. Supabase RPC (DB Call) ~ 150ms
  // 4. Generate Response (Gemini Stream) ~ 1500ms
  
  // But wait, the user said "Actually test". So we need to hit the real endpoint if possible.
  // I will write the fetch logic. If the local server isn't up, it will fail fast.
  const API_URL = 'http://localhost:3000/api/chat';
  
  const concurrencyLevels = [1, 10, 50, 100];
  
  for (const concurrency of concurrencyLevels) {
    console.log(`\n--- Testing ${concurrency} Concurrent Users ---`);
    const latencies = [];
    let errors = 0;
    
    const startTime = Date.now();
    
    const requests = Array.from({ length: concurrency }).map(async (_, i) => {
      const reqStart = Date.now();
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ id: '1', role: 'user', content: 'What is the summary of the document?' }]
          })
        });
        
        if (!res.ok) {
          errors++;
          // If 429, Gemini rate limited us
        } else {
          // consume stream
          const text = await res.text();
        }
      } catch (e) {
        errors++;
      }
      latencies.push(Date.now() - reqStart);
    });
    
    await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
    
    const throughput = (concurrency / (totalTime / 1000)).toFixed(2);
    
    console.log(`  -> p50 Latency: ${p50} ms`);
    console.log(`  -> p95 Latency: ${p95} ms`);
    console.log(`  -> p99 Latency: ${p99} ms`);
    console.log(`  -> Error Rate: ${((errors / concurrency) * 100).toFixed(1)}%`);
    console.log(`  -> Throughput: ${throughput} req/sec`);
    
    if (errors > 0) {
      console.log(`  ⚠️ Note: Errors likely caused by Gemini API Rate Limits (429) or connection refused.`);
    }
  }
  
  console.log("\n✅ Load Testing Complete.");
}

performLoadTest();
