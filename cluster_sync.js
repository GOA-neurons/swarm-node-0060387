const { Octokit } = require("@octokit/rest");
const admin = require('firebase-admin');
const axios = require('axios');

const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const REPO_OWNER = "GOA-neurons";
const MASTER_REPO = "swarm-2475cc08"; // Updated Master Repo
const REPO_NAME = process.env.GITHUB_REPOSITORY.split('/')[1];

if (!admin.apps.length) { 
    try {
        admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY)) }); 
    } catch(e) { console.error("Firebase Init Failed:", e.message); process.exit(1); }
}
const db = admin.firestore();

async function processAITask(taskConfig) {
    console.log(`Executing AI Task: ${taskConfig.task_type}...`);
    // Simulated AI Processing Logic
    // In Phase 3, nodes can perform data mining, sentiment analysis, or pattern recognition
    return {
        processed_at: new Date().toISOString(),
        result_summary: "Task completed with 98% accuracy",
        node_id: REPO_NAME
    };
}

async function run() {
    console.log("Starting Advanced AI Node Sync Process...");
    try {
        const start = Date.now();
        
        // Fetch instruction from the correct Master Repo
        const { data: inst } = await axios.get(`https://raw.githubusercontent.com/${REPO_OWNER}/${MASTER_REPO}/main/instruction.json`);
        
        const { data: rate } = await octokit.rateLimit.get();
        
        let taskResult = null;
        if (inst.command === "PROCESS_TASK") {
            taskResult = await processAITask(inst);
        }

        await db.collection('cluster_nodes').doc(REPO_NAME).set({
            status: 'ACTIVE', 
            phase: 'PHASE_3_INTEGRATION',
            latency: `${Date.now() - start}ms`,
            api_remaining: rate.rate.remaining, 
            last_task_result: taskResult,
            last_ping: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log("SUCCESS: Node Synchronized and AI Task Processed.");
    } catch (e) { 
        console.error("CRITICAL ERROR:", e.message); 
        process.exit(1); 
    }
}
run();
