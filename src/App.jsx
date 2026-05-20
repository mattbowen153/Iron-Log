import { useState, useEffect, useRef, useCallback } from "react";

// ─── Google Fonts ─────────────────────────────────────────────────
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet"/>
);

// ─── Constants ────────────────────────────────────────────────────
const SK = "ironlog_v2";
const load = () => { try { return JSON.parse(localStorage.getItem(SK)) || {}; } catch { return {}; } };
const save = (d) => localStorage.setItem(SK, JSON.stringify(d));

const TODAY = new Date().toISOString().split("T")[0];

const DAY_COLORS = {
  Push:      { bg: "#dc2626", light: "#fca5a5", dim: "rgba(220,38,38,0.15)" },
  Pull:      { bg: "#2563eb", light: "#93c5fd", dim: "rgba(37,99,235,0.15)" },
  Legs:      { bg: "#7c3aed", light: "#c4b5fd", dim: "rgba(124,58,237,0.15)" },
  "Full Body":{ bg: "#d97706", light: "#fcd34d", dim: "rgba(217,119,6,0.15)" },
  Hotel:     { bg: "#059669", light: "#6ee7b7", dim: "rgba(5,150,105,0.15)" },
  Rest:      { bg: "#374151", light: "#9ca3af", dim: "rgba(55,65,81,0.15)" },
};

const IFF_LOCATIONS = [
  "Idaho Fitness Factory – Boise (Milwaukee)",
  "Idaho Fitness Factory – Eagle",
  "Idaho Fitness Factory – Meridian",
  "Idaho Fitness Factory – Nampa",
  "Idaho Fitness Factory – Caldwell",
  "Idaho Fitness Factory – Twin Falls",
];
const HOTEL_LOCATIONS = ["Hilton Hotel Gym","Hampton Inn Gym","DoubleTree Gym","Homewood Suites Gym","Home2 Suites Gym","Embassy Suites Gym"];
const LOCATIONS = [...IFF_LOCATIONS, ...HOTEL_LOCATIONS, "Home","Other"];

// ─── Pre-built Programs ───────────────────────────────────────────
const PROGRAMS = {
  "Classic PPL": {
    description: "6-day Push/Pull/Legs with a rest day. Ideal for 3–4 days/week — run it Mon/Wed/Fri or any 3 days.",
    color: "#dc2626",
    schedule: ["Push","Pull","Legs","Rest","Push","Pull","Legs"],
    workouts: {
      Push: {
        name: "Push Day — Chest, Shoulders & Tris",
        exercises: [
          { name:"Bench Press", notes:"Primary chest builder.", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"}] },
          { name:"Overhead Press", notes:"Seated or standing.", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"}] },
          { name:"Dumbbell Incline Press", notes:"Upper chest, different angle from barbell.", sets:[{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Normal"}] },
          { name:"Lateral Raise", notes:"Superset with triceps.", sets:[{w:"",r:"15",p:"",t:"Superset"},{w:"",r:"15",p:"",t:"Superset"},{w:"",r:"15",p:"",t:"Superset"}] },
          { name:"Tricep Pushdown", notes:"Cable or rope. Drop set on last.", sets:[{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"10",p:"",t:"Drop Set"}] },
        ]
      },
      Pull: {
        name: "Pull Day — Back & Bis",
        exercises: [
          { name:"Deadlift", notes:"King of all pulls.", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"3",p:"",t:"Normal"}] },
          { name:"Pull-Ups", notes:"Vertical pull — different pattern from deadlift.", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"6",p:"",t:"Normal"}] },
          { name:"Barbell Row", notes:"Horizontal pull. Overhand grip, pull to belly.", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"}] },
          { name:"Face Pull", notes:"Superset with curls.", sets:[{w:"",r:"15",p:"",t:"Superset"},{w:"",r:"15",p:"",t:"Superset"},{w:"",r:"15",p:"",t:"Superset"}] },
          { name:"Bicep Curl", notes:"Full ROM. Drop set on last.", sets:[{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"10",p:"",t:"Drop Set"}] },
        ]
      },
      Legs: {
        name: "Leg Day — Quads, Hams & Glutes",
        exercises: [
          { name:"Squat", notes:"Depth is king.", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"}] },
          { name:"Romanian Deadlift", notes:"Feel the hamstring stretch.", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"}] },
          { name:"Leg Press", notes:"Feet high for hams/glutes.", sets:[{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Normal"}] },
          { name:"Leg Curl", notes:"Superset with hip thrust.", sets:[{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"12",p:"",t:"Superset"}] },
          { name:"Hip Thrust", notes:"Squeeze at top. Drop set on last.", sets:[{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"12",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Drop Set"}] },
        ]
      },
    }
  },
  "PPL + Full Body": {
    description: "Your current split — Push, Pull, Legs plus a Full Body day. 3–4 days/week.",
    color: "#d97706",
    schedule: ["Push","Pull","Rest","Legs","Full Body","Rest","Rest"],
    workouts: {
      Push: {
        name: "Push Day",
        exercises: [
          { name:"Bench Press", notes:"", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"3",p:"",t:"Normal"}] },
          { name:"Dumbbell Incline Press", notes:"Upper chest, fresh stimulus vs barbell.", sets:[{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Normal"}] },
          { name:"Overhead Press", notes:"", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"}] },
          { name:"Lateral Raise", notes:"Superset with triceps.", sets:[{w:"",r:"15",p:"",t:"Superset"},{w:"",r:"15",p:"",t:"Superset"},{w:"",r:"15",p:"",t:"Superset"}] },
          { name:"Tricep Pushdown", notes:"", sets:[{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"12",p:"",t:"Superset"}] },
        ]
      },
      Pull: {
        name: "Pull Day",
        exercises: [
          { name:"Deadlift", notes:"", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"}] },
          { name:"Pull-Ups", notes:"Vertical pull — breaks up barbell work.", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"}] },
          { name:"Dumbbell Row", notes:"Single arm, chest on bench. Horizontal pull.", sets:[{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Normal"}] },
          { name:"Face Pull", notes:"Superset with curls.", sets:[{w:"",r:"15",p:"",t:"Superset"},{w:"",r:"15",p:"",t:"Superset"},{w:"",r:"15",p:"",t:"Superset"}] },
          { name:"Bicep Curl", notes:"Drop set on last.", sets:[{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"10",p:"",t:"Drop Set"}] },
        ]
      },
      Legs: {
        name: "Leg Day",
        exercises: [
          { name:"Squat", notes:"", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"}] },
          { name:"Romanian Deadlift", notes:"", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"}] },
          { name:"Leg Press", notes:"", sets:[{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Normal"}] },
          { name:"Leg Curl", notes:"Superset with hip thrust.", sets:[{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"12",p:"",t:"Superset"}] },
          { name:"Hip Thrust", notes:"", sets:[{w:"",r:"12",p:"",t:"Superset"},{w:"",r:"12",p:"",t:"Normal"},{w:"",r:"12",p:"",t:"Normal"}] },
        ]
      },
      "Full Body": {
        name: "Full Body Day",
        exercises: [
          { name:"Squat", notes:"", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"}] },
          { name:"Bench Press", notes:"", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"}] },
          { name:"Pull-Ups", notes:"Bodyweight pull — breaks up barbell work.", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"}] },
          { name:"Overhead Press", notes:"", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"}] },
          { name:"Romanian Deadlift", notes:"", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"}] },
        ]
      },
    }
  },
  "Hotel Mode": {
    description: "Bodyweight + minimal equipment. Perfect for Hilton stays on the road.",
    color: "#059669",
    schedule: ["Hotel","Rest","Hotel","Rest","Hotel","Rest","Rest"],
    workouts: {
      Hotel: {
        name: "Hotel Gym Workout",
        exercises: [
          { name:"Push-Ups", notes:"Chest to floor.", sets:[{w:"0",r:"20",p:"",t:"Normal"},{w:"0",r:"20",p:"",t:"Normal"},{w:"0",r:"15",p:"",t:"Drop Set"}] },
          { name:"Pull-Ups", notes:"Use any bar you can find.", sets:[{w:"0",r:"10",p:"",t:"Normal"},{w:"0",r:"10",p:"",t:"Normal"},{w:"0",r:"8",p:"",t:"Normal"}] },
          { name:"Bodyweight Squat", notes:"Superset with lunges.", sets:[{w:"0",r:"20",p:"",t:"Superset"},{w:"0",r:"20",p:"",t:"Superset"},{w:"0",r:"20",p:"",t:"Superset"}] },
          { name:"Lunges", notes:"Walking if space allows.", sets:[{w:"0",r:"16",p:"",t:"Superset"},{w:"0",r:"16",p:"",t:"Superset"},{w:"0",r:"16",p:"",t:"Superset"}] },
          { name:"Plank", notes:"Hold as long as possible.", sets:[{w:"0",r:"60",p:"",t:"Normal"},{w:"0",r:"60",p:"",t:"Normal"},{w:"0",r:"45",p:"",t:"Normal"}] },
        ]
      }
    }
  },
  "Strength Block": {
    description: "Low rep, high intensity. 4 days — focus on PRs. Great for a 4-week push.",
    color: "#dc2626",
    schedule: ["Push","Pull","Rest","Legs","Rest","Full Body","Rest"],
    workouts: {
      Push: {
        name: "Heavy Push",
        exercises: [
          { name:"Bench Press", notes:"Work up to heavy 3–5.", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"3",p:"",t:"Normal"},{w:"",r:"1",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"}] },
          { name:"Overhead Press", notes:"", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"3",p:"",t:"Normal"}] },
          { name:"Dumbbell Incline Press", notes:"Upper chest accessory after heavy barbell.", sets:[{w:"",r:"6",p:"",t:"Normal"},{w:"",r:"6",p:"",t:"Normal"},{w:"",r:"6",p:"",t:"Normal"}] },
          { name:"Tricep Pushdown", notes:"", sets:[{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"10",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Drop Set"}] },
        ]
      },
      Pull: {
        name: "Heavy Pull",
        exercises: [
          { name:"Deadlift", notes:"Heavy singles or triples.", sets:[{w:"",r:"3",p:"",t:"Normal"},{w:"",r:"3",p:"",t:"Normal"},{w:"",r:"1",p:"",t:"Normal"}] },
          { name:"Weighted Pull-Ups", notes:"Vertical pull — different from deadlift pattern.", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"4",p:"",t:"Normal"}] },
          { name:"Barbell Row", notes:"Horizontal pull. Heavy and controlled.", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"}] },
          { name:"Bicep Curl", notes:"Drop set on last.", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"6",p:"",t:"Drop Set"}] },
        ]
      },
      Legs: {
        name: "Heavy Legs",
        exercises: [
          { name:"Squat", notes:"Work up to heavy 5.", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"3",p:"",t:"Normal"},{w:"",r:"1",p:"",t:"Normal"}] },
          { name:"Romanian Deadlift", notes:"", sets:[{w:"",r:"6",p:"",t:"Normal"},{w:"",r:"6",p:"",t:"Normal"},{w:"",r:"6",p:"",t:"Normal"}] },
          { name:"Leg Press", notes:"Heavy — 8 reps.", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"}] },
          { name:"Hip Thrust", notes:"", sets:[{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"},{w:"",r:"8",p:"",t:"Normal"}] },
        ]
      },
      "Full Body": {
        name: "Power Full Body",
        exercises: [
          { name:"Squat", notes:"", sets:[{w:"",r:"3",p:"",t:"Normal"},{w:"",r:"3",p:"",t:"Normal"},{w:"",r:"3",p:"",t:"Normal"}] },
          { name:"Bench Press", notes:"", sets:[{w:"",r:"3",p:"",t:"Normal"},{w:"",r:"3",p:"",t:"Normal"},{w:"",r:"3",p:"",t:"Normal"}] },
          { name:"Deadlift", notes:"", sets:[{w:"",r:"3",p:"",t:"Normal"},{w:"",r:"3",p:"",t:"Normal"},{w:"",r:"1",p:"",t:"Normal"}] },
          { name:"Overhead Press", notes:"", sets:[{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"},{w:"",r:"5",p:"",t:"Normal"}] },
        ]
      },
    }
  },
};

const ALL_EXERCISES = {
  Push: ["Bench Press","Dumbbell Incline Press","Overhead Press","Dumbbell Shoulder Press","Cable Fly","Lateral Raise","Tricep Pushdown","Skull Crushers","Dips","Push-Ups","Cable Lateral Raise","Arnold Press","Chest Dips","Close Grip Bench","Dumbbell Flat Press","Pec Deck"],
  Pull: ["Deadlift","Barbell Row","Pull-Ups","Lat Pulldown","Seated Cable Row","Face Pull","Bicep Curl","Hammer Curl","Preacher Curl","Shrugs","Dumbbell Row","Weighted Pull-Ups","T-Bar Row"],
  Legs: ["Squat","Leg Press","Romanian Deadlift","Leg Curl","Leg Extension","Calf Raise","Hip Thrust","Lunges","Hack Squat","Bulgarian Split Squat","Sumo Squat","Goblet Squat","Step-Ups","Nordic Curl"],
  "Full Body": ["Squat","Bench Press","Deadlift","Overhead Press","Barbell Row","Clean & Press","Thruster","Kettlebell Swing","Pull-Ups","Romanian Deadlift"],
  Hotel: ["Push-Ups","Pull-Ups","Bodyweight Squat","Lunges","Dips","Plank","Mountain Climbers","Jumping Jacks","Burpees","Hip Thrust (bodyweight)","Pike Push-Ups","Tricep Dips","Jump Squats","Wall Sit"],
};

// ─── Helpers ──────────────────────────────────────────────────────
const vol = (sets) => sets.reduce((a,s)=>a+(((parseFloat(s.w)||0)*((parseInt(s.r)||0)+(parseInt(s.p)||0)*0.5))),0);
const e1rm = (w,r) => r>0 ? Math.round((parseFloat(w)||0)*(1+(parseInt(r)||0)/30)) : 0;
const daysInMonth = (y,m) => new Date(y,m+1,0).getDate();
const firstDay = (y,m) => new Date(y,m,1).getDay();
const ymd = (d) => d.toISOString().split("T")[0];

// PR detection — strictly greater than previous best, never equal
// Returns 'weight' (new e1RM), 'reps' (same weight more reps), or null
const getPRType = (w, r, prevBestE1rm, prevBestRepsAtWeight) => {
  const curE1rm = e1rm(w, r);
  if (!curE1rm || !w || !r) return null;
  // New e1RM PR (covers weight increase or volume increase)
  if (curE1rm > prevBestE1rm) return "weight";
  // Rep PR — same weight, strictly more reps than ever done at this weight
  const curReps = parseInt(r) || 0;
  if (parseFloat(w) > 0 && prevBestRepsAtWeight && curReps > prevBestRepsAtWeight) return "reps";
  return null;
};

// ─── Styles ───────────────────────────────────────────────────────
const S = {
  app: { minHeight:"100vh", background:"#080808", color:"#e8e8e8", fontFamily:"'Barlow', sans-serif", paddingBottom:80 },
  header: { background:"#0d0d0d", borderBottom:"1px solid #1c1c1c", padding:"14px 16px 10px", display:"flex", justifyContent:"space-between", alignItems:"flex-end" },
  title: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:30, letterSpacing:3, color:"#fff", lineHeight:1 },
  subtitle: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:600, fontSize:13, letterSpacing:2, color:"#444", marginTop:1 },
  statsRow: { display:"flex", gap:16, alignItems:"baseline" },
  statBig: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:28, color:"#ef4444", lineHeight:1 },
  statLbl: { fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#444", letterSpacing:1 },
  tabBar: { position:"fixed", bottom:0, left:0, right:0, background:"#0d0d0d", borderTop:"1px solid #1c1c1c", display:"flex", zIndex:100 },
  tab: (active) => ({ flex:1, padding:"10px 0", background:"none", border:"none", color:active?"#fff":"#555", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:11, letterSpacing:1.5, cursor:"pointer", borderTop:active?"2px solid #ef4444":"2px solid transparent", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }),
  content: { padding:"14px 14px 0", maxWidth:640, margin:"0 auto" },
  card: { background:"#111", border:"1px solid #1c1c1c", borderRadius:10, padding:14, marginBottom:12 },
  sectionTitle: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:20, letterSpacing:2, color:"#fff", marginBottom:12 },
  btn: (color="#ef4444",bg="#1c0808") => ({ background:bg, color:color, border:`1px solid ${color}33`, borderRadius:6, padding:"7px 14px", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:14, letterSpacing:1, cursor:"pointer" }),
  input: { background:"#0d0d0d", color:"#fff", border:"1px solid #222", borderRadius:6, padding:"7px 10px", fontSize:14, fontFamily:"'Barlow', sans-serif" },
};

// ─── PRBadge ──────────────────────────────────────────────────────

// Smart swap alternatives — grouped by what the exercise primarily targets
const SWAP_OPTIONS = {
  // Chest
  "Bench Press":          { label:"Chest · Horizontal Press",  alts:["Dumbbell Flat Press","Machine Chest Press","Push-Ups","Floor Press","Cable Chest Press"] },
  "Dumbbell Flat Press":  { label:"Chest · Horizontal Press",  alts:["Bench Press","Machine Chest Press","Push-Ups","Cable Chest Press"] },
  "Dumbbell Incline Press":{ label:"Chest · Incline Press",    alts:["Incline Barbell Press","Incline Machine Press","Cable Incline Fly","Low-to-High Cable Fly"] },
  "Incline Bench Press":  { label:"Chest · Incline Press",     alts:["Dumbbell Incline Press","Incline Machine Press","Cable Incline Fly","Smith Machine Incline"] },
  "Cable Fly":            { label:"Chest · Isolation",         alts:["Pec Deck","Dumbbell Fly","Low-to-High Cable Fly","High-to-Low Cable Fly"] },
  // Shoulders
  "Overhead Press":       { label:"Shoulders · Press",         alts:["Dumbbell Shoulder Press","Arnold Press","Smith Machine OHP","Seated DB Press","Machine Shoulder Press"] },
  "Dumbbell Shoulder Press":{ label:"Shoulders · Press",       alts:["Overhead Press","Arnold Press","Machine Shoulder Press","Seated Cable Press"] },
  "Lateral Raise":        { label:"Shoulders · Lateral",       alts:["Cable Lateral Raise","Machine Lateral Raise","Dumbbell Lateral Raise","Leaning Lateral Raise"] },
  "Face Pull":            { label:"Shoulders · Rear Delt",     alts:["Reverse Pec Deck","Dumbbell Rear Delt Fly","Band Face Pull","Seated Cable Row (high)"] },
  // Triceps
  "Tricep Pushdown":      { label:"Triceps · Isolation",       alts:["Overhead Tricep Extension","Skull Crushers","Close Grip Bench","Dumbbell Kickback","Dips"] },
  "Skull Crushers":       { label:"Triceps · Isolation",       alts:["Overhead Tricep Extension","Tricep Pushdown","Close Grip Bench","Cable Overhead Extension"] },
  "Dips":                 { label:"Triceps / Chest",           alts:["Close Grip Bench","Tricep Pushdown","Bench Dips","Machine Dips"] },
  // Back — vertical
  "Pull-Ups":             { label:"Back · Vertical Pull",      alts:["Lat Pulldown","Assisted Pull-Ups","Neutral Grip Pull-Up","Cable Straight Arm Pulldown"] },
  "Weighted Pull-Ups":    { label:"Back · Vertical Pull",      alts:["Lat Pulldown","Pull-Ups","Neutral Grip Pull-Up","Cable Pullover"] },
  "Lat Pulldown":         { label:"Back · Vertical Pull",      alts:["Pull-Ups","Assisted Pull-Ups","Neutral Grip Pulldown","Single Arm Pulldown"] },
  // Back — horizontal
  "Deadlift":             { label:"Back · Hinge",              alts:["Trap Bar Deadlift","Romanian Deadlift","Rack Pull","Dumbbell Deadlift","Cable Pull-Through"] },
  "Barbell Row":          { label:"Back · Horizontal Pull",    alts:["Dumbbell Row","Seated Cable Row","T-Bar Row","Chest Supported Row","Pendlay Row"] },
  "Dumbbell Row":         { label:"Back · Horizontal Pull",    alts:["Barbell Row","Seated Cable Row","T-Bar Row","Chest Supported Row","Machine Row"] },
  "Seated Cable Row":     { label:"Back · Horizontal Pull",    alts:["Barbell Row","Dumbbell Row","Machine Row","Chest Supported Row"] },
  // Biceps
  "Bicep Curl":           { label:"Biceps",                    alts:["Hammer Curl","Preacher Curl","Incline Dumbbell Curl","Cable Curl","Machine Curl"] },
  "Hammer Curl":          { label:"Biceps · Neutral",          alts:["Bicep Curl","Rope Hammer Curl","Cross Body Curl","Cable Hammer Curl"] },
  // Legs — quad
  "Squat":                { label:"Legs · Quad Dominant",      alts:["Goblet Squat","Leg Press","Hack Squat","Smith Machine Squat","Bulgarian Split Squat"] },
  "Leg Press":            { label:"Legs · Quad Dominant",      alts:["Squat","Hack Squat","Smith Machine Squat","Leg Extension"] },
  "Hack Squat":           { label:"Legs · Quad Dominant",      alts:["Squat","Leg Press","Smith Machine Squat","Bulgarian Split Squat"] },
  "Leg Extension":        { label:"Legs · Quad Isolation",     alts:["Squat","Spanish Squat","Terminal Knee Extension","Wall Sit"] },
  // Legs — hamstring
  "Romanian Deadlift":    { label:"Legs · Hip Hinge / Hamstring", alts:["Stiff Leg Deadlift","Good Morning","Nordic Curl","Lying Leg Curl","Cable Pull-Through"] },
  "Leg Curl":             { label:"Legs · Hamstring Isolation",alts:["Romanian Deadlift","Nordic Curl","Good Morning","Seated Leg Curl","Swiss Ball Curl"] },
  // Legs — glutes
  "Hip Thrust":           { label:"Legs · Glute Dominant",     alts:["Glute Bridge","Cable Pull-Through","Donkey Kick","Single Leg Hip Thrust","Romanian Deadlift"] },
  // Legs — calf
  "Calf Raise":           { label:"Calves",                    alts:["Seated Calf Raise","Leg Press Calf Raise","Single Leg Calf Raise","Donkey Calf Raise"] },
  // Hotel
  "Push-Ups":             { label:"Chest / Triceps",           alts:["Pike Push-Ups","Wide Push-Ups","Diamond Push-Ups","Decline Push-Ups","Archer Push-Ups"] },
  "Bodyweight Squat":     { label:"Legs · Bodyweight",         alts:["Jump Squat","Sumo Squat","Wall Sit","Lunge","Bulgarian Split Squat"] },
  "Lunges":               { label:"Legs · Bodyweight",         alts:["Bodyweight Squat","Step-Ups","Reverse Lunge","Walking Lunge","Bulgarian Split Squat"] },
  "Plank":                { label:"Core",                      alts:["Dead Bug","Ab Wheel","Mountain Climbers","Hollow Hold","L-Sit"] },
};

// ─── Equipment groups — used for smart superset suggestions ───────
const EQUIPMENT_GROUP = {
  cable: ["Face Pull","Tricep Pushdown","Cable Fly","Cable Lateral Raise","Lat Pulldown","Seated Cable Row","Cable Curl","Rope Hammer Curl","Cable Overhead Extension","Cable Straight Arm Pulldown","Cable Pull-Through","Low-to-High Cable Fly","High-to-Low Cable Fly","Cable Incline Fly","Cable Chest Press","Cable Hammer Curl"],
  dumbbell: ["Dumbbell Incline Press","Dumbbell Flat Press","Dumbbell Shoulder Press","Dumbbell Row","Lateral Raise","Hammer Curl","Bicep Curl","Skull Crushers","Arnold Press","Dumbbell Rear Delt Fly","Incline Dumbbell Curl","Dumbbell Fly","Dumbbell Kickback"],
  barbell: ["Bench Press","Squat","Deadlift","Overhead Press","Barbell Row","Romanian Deadlift","Incline Bench Press"],
  machine: ["Leg Curl","Leg Extension","Leg Press","Hack Squat","Pec Deck","Machine Chest Press","Machine Row","Machine Shoulder Press","Machine Lateral Raise","Assisted Pull-Ups"],
  bodyweight: ["Pull-Ups","Push-Ups","Dips","Plank","Lunges","Bodyweight Squat","Mountain Climbers","Burpees"],
};

// Get equipment type for an exercise
const getEquipment = (name) => {
  for (const [eq, list] of Object.entries(EQUIPMENT_GROUP)) {
    if (list.some(n => n.toLowerCase() === name.toLowerCase())) return eq;
  }
  return null;
};

// Smart superset suggestions — same equipment first, then complementary muscle
const getSupersetSuggestions = (exName, allExercises) => {
  const myEquip = getEquipment(exName);
  const mySwap = SWAP_OPTIONS[exName];

  return allExercises
    .filter(n => n !== exName)
    .sort((a, b) => {
      const aEquip = getEquipment(a);
      const bEquip = getEquipment(b);
      const aMatch = myEquip && aEquip === myEquip;
      const bMatch = myEquip && bEquip === myEquip;
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
};

function PRBadge({ type, animate }) {
  const isRep = type === "reps";
  return (
    <span style={{ background: isRep?"#7c3aed":"#fbbf24", color: isRep?"#fff":"#000", fontSize:9, fontWeight:900, padding:"2px 6px", borderRadius:2, letterSpacing:1, marginLeft:4, verticalAlign:"middle", animation: animate ? "prPop 0.4s ease" : "none", whiteSpace:"nowrap" }}>
      {isRep ? "🔁 REP PR" : "🏆 PR"}
    </span>
  );
}

// ─── Rest Timer ───────────────────────────────────────────────────
// Compound moves (barbell main lifts) get longer rest
const COMPOUND_NAMES = ["Bench Press","Squat","Deadlift","Overhead Press","Barbell Row","Romanian Deadlift","Hack Squat","Hip Thrust","Leg Press","Pull-Ups","Weighted Pull-Ups"];
const getRestDuration = (exName, setType) => {
  if (setType === "Drop Set" || setType === "Superset") return 45;
  if (COMPOUND_NAMES.some(n => exName.toLowerCase().includes(n.toLowerCase()))) return 180;
  return 90;
};

function RestTimer({ exName, setType, onDismiss }) {
  const total = getRestDuration(exName, setType);
  const [remaining, setRemaining] = useState(total);
  const [cap, setCap] = useState(total); // tracks adjusted total for progress bar
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(id);
          setDone(true);
          // Vibrate phone — 3 short pulses
          if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [done]);

  const adjust = (delta) => {
    setRemaining(r => {
      const next = Math.max(0, r + delta);
      setCap(c => Math.max(next, c + delta > 0 ? c + delta : c));
      return next;
    });
    if (done && delta > 0) setDone(false);
  };

  const pct = ((cap - remaining) / cap) * 100;
  const color = done ? "#4ade80" : remaining <= 15 ? "#fbbf24" : "#60a5fa";

  const adjBtn = (label, delta) => (
    <button onClick={() => adjust(delta)}
      style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", color:"#888", borderRadius:6, padding:"5px 9px", cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, fontWeight:700, lineHeight:1 }}>
      {label}
    </button>
  );

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, background:"#0a0a0a", borderBottom:`2px solid ${color}`, padding:"10px 16px" }}>
      {/* Progress bar */}
      <div style={{ position:"absolute", bottom:0, left:0, height:2, width:`${pct}%`, background:color, transition:"width 1s linear" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#555", letterSpacing:2 }}>
            {done ? "REST COMPLETE" : "REST TIMER"}
          </div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#444", marginTop:1 }}>
            {exName} · {setType}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {adjBtn("-30", -30)}
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:36, fontWeight:900, color, lineHeight:1, letterSpacing:2, minWidth:72, textAlign:"center" }}>
            {done ? "GO" : `${String(Math.floor(remaining/60)).padStart(2,"0")}:${String(remaining%60).padStart(2,"0")}`}
          </div>
          {adjBtn("+30", 30)}
          <button onClick={onDismiss} style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", color:"#666", borderRadius:6, padding:"6px 10px", cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, fontWeight:700 }}>
            SKIP
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SetRow ───────────────────────────────────────────────────────
function SetRow({ set, idx, onChange, onDel, isPR, ghost, onSetDone }) {
  const isWarmup = !!set.warmup;
  const isDone = !!set.done;
  const typeColor = { Normal:"#666", Superset:"#3b82f6", "Drop Set":"#ef4444" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      {ghost && !isWarmup && (
        <div style={{ display:"flex", gap:6, paddingLeft:22, alignItems:"center" }}>
          <span style={{ color:"#2a2a2a", fontSize:10, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:0.5 }}>
            LAST: {ghost.w ? `${ghost.w} lbs × ${ghost.r} reps` : "—"}
            {ghost.p && parseInt(ghost.p) > 0 ? ` + ${ghost.p} partials` : ""}
          </span>
        </div>
      )}
      <div style={{ display:"flex", gap:5, alignItems:"center",
        background: isWarmup ? "rgba(255,255,255,0.02)" : isDone ? "rgba(74,222,128,0.04)" : set.t==="Superset"?"rgba(59,130,246,0.06)":set.t==="Drop Set"?"rgba(239,68,68,0.06)":"rgba(255,255,255,0.02)",
        borderRadius:7, padding:"7px 9px",
        border: isWarmup?"1px dashed #2a2a2a": isPR?"1px solid #fbbf2444":isDone?"1px solid rgba(74,222,128,0.15)":"1px solid rgba(255,255,255,0.05)",
        opacity: isWarmup ? 0.5 : 1
      }}>
        {/* Warm-up label or set number */}
        {isWarmup
          ? <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#555", letterSpacing:1, minWidth:24, textAlign:"center" }}>W{idx+1}</span>
          : <span style={{ color:"#444", fontSize:11, minWidth:16, textAlign:"right" }}>{idx+1}</span>
        }
        {!isWarmup && (
          <select value={set.t||"Normal"} onChange={e=>onChange({...set,t:e.target.value})}
            style={{ background:"#0d0d0d", color:typeColor[set.t||"Normal"], border:"none", fontSize:11, borderRadius:4, padding:"2px 3px", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, letterSpacing:0.5 }}>
            <option>Normal</option><option>Superset</option><option>Drop Set</option>
          </select>
        )}
        <input type="number" placeholder="lbs" value={set.w} onChange={e=>onChange({...set,w:e.target.value})}
          style={{ width:55, background:"#0d0d0d", color: isWarmup?"#555":"#fff", border:"1px solid #222", borderRadius:5, padding:"5px 6px", fontSize:16, fontWeight:600, textAlign:"center" }}/>
        <span style={{ color:"#444", fontSize:12 }}>×</span>
        <input type="number" placeholder="reps" value={set.r} onChange={e=>onChange({...set,r:e.target.value})}
          style={{ width:48, background:"#0d0d0d", color: isWarmup?"#555":"#fff", border:"1px solid #222", borderRadius:5, padding:"5px 6px", fontSize:16, fontWeight:600, textAlign:"center" }}/>
        {!isWarmup && <>
          <input type="number" placeholder="½ reps" value={set.p} onChange={e=>onChange({...set,p:e.target.value})}
            style={{ width:52, background:"#0d0d0d", color:"#c4b5fd", border:"1px solid #2d2040", borderRadius:5, padding:"5px 4px", fontSize:12, fontWeight:600, textAlign:"center" }}/>
          <span style={{ color:"#2d2040", fontSize:10, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:0.5 }}>PART</span>
        </>}
        {isPR && !isWarmup && <PRBadge type={isPR} animate/>}
        {!isWarmup && (
          <button onClick={()=>onSetDone && onSetDone(set)}
            style={{ marginLeft:"auto", background: isDone?"rgba(74,222,128,0.15)":"#161616", border:`1px solid ${isDone?"#4ade8044":"#2a2a2a"}`, color: isDone?"#4ade80":"#444", borderRadius:5, padding:"4px 8px", cursor:"pointer", fontSize:13, lineHeight:1, fontWeight:700 }}>✓</button>
        )}
        {isWarmup && (
          <button onClick={()=>onSetDone && onSetDone(set)}
            style={{ marginLeft:"auto", background: isDone?"rgba(74,222,128,0.1)":"none", border:`1px solid ${isDone?"#4ade8033":"#2a2a2a"}`, color: isDone?"#4ade80":"#333", borderRadius:5, padding:"4px 8px", cursor:"pointer", fontSize:12, lineHeight:1 }}>✓</button>
        )}
        <button onClick={onDel} style={{ background:"none", border:"none", color:"#2a2a2a", cursor:"pointer", fontSize:16, lineHeight:1, padding:"0 2px" }}>×</button>
      </div>
    </div>
  );
}

// ─── SupersetBracket ─────────────────────────────────────────────
function SupersetBracket({ exA, exB, onChangeA, onChangeB, onRemoveA, onRemoveB, onUnlink, history, dayType, onStartRest }) {

  const addRound = () => {
    const lA = exA.sets[exA.sets.length-1]||{};
    const lB = exB.sets[exB.sets.length-1]||{};
    onChangeA({...exA, sets:[...exA.sets,{w:lA.w||"",r:lA.r||"",p:"",t:"Normal",done:false}]});
    onChangeB({...exB, sets:[...exB.sets,{w:lB.w||"",r:lB.r||"",p:"",t:"Normal",done:false}]});
  };
  const delRound = (i) => {
    onChangeA({...exA, sets:exA.sets.filter((_,j)=>j!==i)});
    onChangeB({...exB, sets:exB.sets.filter((_,j)=>j!==i)});
  };
  const updA = (i,s) => onChangeA({...exA, sets:exA.sets.map((x,j)=>j===i?s:x)});
  const updB = (i,s) => onChangeB({...exB, sets:exB.sets.map((x,j)=>j===i?s:x)});

  const lastSetsA = ((history||[]).slice().reverse().find(d=>(d.exercises||[]).some(e=>e.name===exA.name))?.exercises?.find(e=>e.name===exA.name)?.sets)||[];
  const lastSetsB = ((history||[]).slice().reverse().find(d=>(d.exercises||[]).some(e=>e.name===exB.name))?.exercises?.find(e=>e.name===exB.name)?.sets)||[];
  const prevBestA = Math.max(0,...(history||[]).flatMap(d=>(d.exercises||[]).filter(e=>e.name===exA.name).flatMap(e=>e.sets.map(s=>e1rm(s.w,s.r)))));
  const prevBestB = Math.max(0,...(history||[]).flatMap(d=>(d.exercises||[]).filter(e=>e.name===exB.name).flatMap(e=>e.sets.map(s=>e1rm(s.w,s.r)))));

  const maxSets = Math.max(exA.sets.length, exB.sets.length);
  const roundsDone = Array.from({length:maxSets}).filter((_,i)=>exA.sets[i]?.done && exB.sets[i]?.done).length;

  // Shared input style
  const inp = (border="#1e3a6e") => ({ background:"#0a0f1a", color:"#fff", border:`1px solid ${border}`, borderRadius:5, padding:"6px 4px", fontSize:15, fontWeight:700, textAlign:"center", width:"100%" });

  return (
    <div style={{ marginBottom:12, background:"#080e1c", border:"1px solid #1e3a6e", borderRadius:12, overflow:"hidden" }}>

      {/* Header */}
      <div style={{ background:"#0f1e3a", borderBottom:"1px solid #1e3a6e", padding:"7px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:13 }}>⚡</span>
          <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:13, color:"#60a5fa", letterSpacing:2 }}>SUPERSET</span>
          <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#2a4a8e" }}>{roundsDone}/{maxSets} done</span>
        </div>
        <button onClick={onUnlink} style={{ background:"none", border:"1px solid #1e3a6e", color:"#3b5a9e", borderRadius:5, padding:"3px 8px", cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, letterSpacing:1 }}>UNLINK</button>
      </div>

      {/* Column headers */}
      <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 28px 1fr 32px", borderBottom:"1px solid #1e3a6e", padding:"6px 10px", gap:4, alignItems:"end" }}>
        <div/>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:13, color:"#60a5fa", letterSpacing:0.5, lineHeight:1.1 }}>{exA.name}</div>
          {lastSetsA[0] && <div style={{ color:"#1e3a6e", fontSize:9, fontFamily:"'Barlow Condensed', sans-serif", marginTop:1 }}>last: {lastSetsA[0].w}×{lastSetsA[0].r}</div>}
        </div>
        <div/>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:13, color:"#818cf8", letterSpacing:0.5, lineHeight:1.1 }}>{exB.name}</div>
          {lastSetsB[0] && <div style={{ color:"#1e3a6e", fontSize:9, fontFamily:"'Barlow Condensed', sans-serif", marginTop:1 }}>last: {lastSetsB[0].w}×{lastSetsB[0].r}</div>}
        </div>
        <div/>
      </div>

      {/* Sub-header: lbs × reps labels */}
      <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 28px 1fr 32px", padding:"2px 10px 4px", gap:4 }}>
        <div/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#1e3a6e", textAlign:"center", letterSpacing:1 }}>LBS</div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#1e3a6e", textAlign:"center", letterSpacing:1 }}>REPS</div>
        </div>
        <div/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#1e3a6e", textAlign:"center", letterSpacing:1 }}>LBS</div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#1e3a6e", textAlign:"center", letterSpacing:1 }}>REPS</div>
        </div>
        <div/>
      </div>

      {/* Rounds */}
      <div style={{ padding:"4px 10px 8px", display:"flex", flexDirection:"column", gap:4 }}>
        {Array.from({length:maxSets}).map((_,i) => {
          const sA = exA.sets[i] || {w:"",r:"",p:"",done:false};
          const sB = exB.sets[i] || {w:"",r:"",p:"",done:false};
          const roundDone = sA.done && sB.done;
          const isPRA = e1rm(sA.w,sA.r)>0 && e1rm(sA.w,sA.r)>prevBestA;
          const isPRB = e1rm(sB.w,sB.r)>0 && e1rm(sB.w,sB.r)>prevBestB;

          return (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"28px 1fr 28px 1fr 32px", gap:4, alignItems:"center",
              background: roundDone?"rgba(74,222,128,0.05)":"rgba(30,58,110,0.15)",
              borderRadius:7, padding:"5px 4px", border:`1px solid ${roundDone?"#4ade8022":"#1e3a6e44"}` }}>

              {/* Round number */}
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color: roundDone?"#4ade80":"#3b82f6", fontWeight:700 }}>{i+1}</div>
                {(lastSetsA[i]||lastSetsB[i]) && <div style={{ fontSize:8, color:"#1e3a6e" }}>↑prev</div>}
              </div>

              {/* Exercise A inputs */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, position:"relative" }}>
                <input type="number" placeholder="lbs" value={sA.w} onChange={e=>updA(i,{...sA,w:e.target.value})} style={inp()}/>
                <div style={{ position:"relative" }}>
                  <input type="number" placeholder="reps" value={sA.r} onChange={e=>updA(i,{...sA,r:e.target.value})} style={inp()}/>
                  {isPRA && <span style={{ position:"absolute", top:-6, right:-2, background:"#fbbf24", color:"#000", fontSize:7, fontWeight:900, padding:"1px 3px", borderRadius:2 }}>PR</span>}
                </div>
                {lastSetsA[i] && <div style={{ position:"absolute", bottom:-11, left:0, right:0, textAlign:"center", fontSize:8, color:"#1e3a6e", fontFamily:"'Barlow Condensed', sans-serif" }}>{lastSetsA[i].w}×{lastSetsA[i].r}</div>}
              </div>

              {/* Divider */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <div style={{ width:1, flex:1, background:"#1e3a6e" }}/>
                <span style={{ color:"#1e3a6e", fontSize:10 }}>→</span>
                <div style={{ width:1, flex:1, background:"#1e3a6e" }}/>
              </div>

              {/* Exercise B inputs */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, position:"relative" }}>
                <input type="number" placeholder="lbs" value={sB.w} onChange={e=>updB(i,{...sB,w:e.target.value})} style={inp("#312e81")}/>
                <div style={{ position:"relative" }}>
                  <input type="number" placeholder="reps" value={sB.r} onChange={e=>updB(i,{...sB,r:e.target.value})} style={inp("#312e81")}/>
                  {isPRB && <span style={{ position:"absolute", top:-6, right:-2, background:"#fbbf24", color:"#000", fontSize:7, fontWeight:900, padding:"1px 3px", borderRadius:2 }}>PR</span>}
                </div>
                {lastSetsB[i] && <div style={{ position:"absolute", bottom:-11, left:0, right:0, textAlign:"center", fontSize:8, color:"#1e3a6e", fontFamily:"'Barlow Condensed', sans-serif" }}>{lastSetsB[i].w}×{lastSetsB[i].r}</div>}
              </div>

              {/* Done + delete */}
              <div style={{ display:"flex", flexDirection:"column", gap:3, alignItems:"center" }}>
                <button onClick={()=>{
                  const bothDone = !roundDone;
                  updA(i,{...sA,done:bothDone});
                  updB(i,{...sB,done:bothDone});
                  if(bothDone) onStartRest&&onStartRest(exA.name,"Superset");
                }} style={{ background: roundDone?"rgba(74,222,128,0.2)":"#0f1e3a", border:`1px solid ${roundDone?"#4ade8066":"#1e3a6e"}`, color:roundDone?"#4ade80":"#3b82f6", borderRadius:5, padding:"4px 6px", cursor:"pointer", fontSize:12, fontWeight:900, width:"100%" }}>
                  {roundDone?"✓":"✓"}
                </button>
                <button onClick={()=>delRound(i)} style={{ background:"none", border:"none", color:"#1e3a6e", cursor:"pointer", fontSize:13, lineHeight:1 }}>×</button>
              </div>
            </div>
          );
        })}

        {/* Spacing for ghost labels */}
        <div style={{ height:4 }}/>
      </div>

      {/* Add round */}
      <div style={{ padding:"0 10px 10px" }}>
        <button onClick={addRound}
          style={{ width:"100%", background:"#0f1e3a", border:"1px dashed #1e3a6e", color:"#3b82f6", borderRadius:6, padding:"7px 0", fontSize:12, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, letterSpacing:1 }}>
          + ROUND
        </button>
      </div>
    </div>
  );
}

// ─── ExerciseBlock ────────────────────────────────────────────────
function ExerciseBlock({ ex, onChange, onRemove, history, dayType, onStartRest, isSupersetChild, otherExercises, onLinkSuperset, exNote, onSaveExNote }) {
  const [showPairPicker, setShowPairPicker] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [swapSearch, setSwapSearch] = useState("");
  const [showNoteEdit, setShowNoteEdit] = useState(false);
  const [noteInput, setNoteInput] = useState(exNote || "");
  const swapRef = useRef(null);

  const smartAddSet = (forceType) => {
    const sets = ex.sets;
    const last = sets[sets.length - 1] || {};
    const lastWeight = parseFloat(last.w) || 0;
    let smartType = forceType || "Normal";
    let smartWeight = last.w || "";
    if (!forceType) {
      if (isSupersetChild) smartType = "Normal"; // inside a superset block, all sets are just normal
      else if (sets.length >= 3) smartType = "Drop Set";
    }
    if (smartType === "Drop Set" && lastWeight > 0) {
      smartWeight = String(Math.round((lastWeight * 0.85) / 5) * 5);
    }
    onChange({ ...ex, sets:[...sets, { w:smartWeight, r:last.r||"", p:"", t:smartType, done:false }] });
  };

  const updSet = (i, s) => onChange({ ...ex, sets:ex.sets.map((x,j)=>j===i?s:x) });
  const delSet = (i) => onChange({ ...ex, sets:ex.sets.filter((_,j)=>j!==i) });

  const handleSetDone = (set, i) => {
    updSet(i, { ...set, done: !set.done });
    if (!set.done) onStartRest && onStartRest(ex.name, isSupersetChild ? "Superset" : set.t || "Normal");
  };

  const lastSession = (history||[]).slice().reverse().find(d => (d.exercises||[]).some(e=>e.name===ex.name));
  const lastSets = lastSession ? (lastSession.exercises.find(e=>e.name===ex.name)?.sets || []) : [];

  const workingSets = ex.sets.filter(s => !s.warmup);
  const histSets = (history||[]).flatMap(d=>(d.exercises||[]).filter(e=>e.name===ex.name).flatMap(e=>(e.sets||[]).filter(s=>!s.warmup)));
  const prevBestE1rm = Math.max(0, ...histSets.map(s=>e1rm(s.w,s.r)));
  const bestRepsAtWeight = {};
  histSets.forEach(s=>{ const w=parseFloat(s.w)||0; const r=parseInt(s.r)||0; if(w>0) bestRepsAtWeight[w]=Math.max(bestRepsAtWeight[w]||0,r); });
  const setPRs = ex.sets.map(s => {
    if (s.warmup) return null;
    return getPRType(s.w, s.r, prevBestE1rm, bestRepsAtWeight[parseFloat(s.w)||0] || 0);
  });
  const totalVol = Math.round(vol(workingSets));
  const color = DAY_COLORS[dayType]||DAY_COLORS["Full Body"];
  const doneSets = workingSets.filter(s=>s.done).length;

  // Progressive overload suggestion
  const overloadSuggestion = (() => {
    if (!lastSession || lastSets.length === 0) return null;
    const lastWorking = lastSets.filter(s=>!s.warmup);
    if (lastWorking.length === 0) return null;
    const lastW = parseFloat(lastWorking[0]?.w) || 0;
    const lastR = parseInt(lastWorking[0]?.r) || 0;
    if (!lastW || !lastR) return null;
    // If they hit all reps last time, suggest +5 lbs (compounds) or +2.5 (accessories)
    const allRepsHit = lastWorking.every(s => parseInt(s.r) >= parseInt(lastWorking[0].r));
    const isCompound = COMPOUND_NAMES.some(n => ex.name.toLowerCase().includes(n.toLowerCase()));
    if (allRepsHit) {
      const inc = isCompound ? 5 : 2.5;
      return { type:"weight", msg:`Try ${lastW + inc} lbs × ${lastR} today`, detail:`+${inc} lbs from last session` };
    }
    // Didn't hit all reps — stay same weight, aim for more reps
    return { type:"reps", msg:`Match ${lastW} lbs, push for more reps`, detail:`Same weight, better reps` };
  })();

  const nextSetHint = () => {
    if (isSupersetChild) return { label:"+ SET", type:"Normal", color:"#888" };
    const hasSuperset = ex.sets.some(s=>s.t==="Superset");
    if (hasSuperset) return { label:"+ SUPERSET SET", type:"Superset", color:"#60a5fa" };
    if (ex.sets.length >= 3) return { label:"+ DROP SET", type:"Drop Set", color:"#f87171" };
    return { label:"+ SET", type:"Normal", color:"#888" };
  };
  const hint = nextSetHint();

  const swapInfo = SWAP_OPTIONS[ex.name];
  const swapAlts = swapInfo?.alts || [];
  const allSwapOptions = swapSearch
    ? [...new Set(Object.keys(SWAP_OPTIONS).concat(Object.values(SWAP_OPTIONS).flatMap(v=>v.alts)))]
        .filter(n => n.toLowerCase().includes(swapSearch.toLowerCase()) && n !== ex.name)
    : swapAlts;

  const doSwap = (newName) => { onChange({ ...ex, name:newName }); setShowSwap(false); setSwapSearch(""); };

  return (
    <div style={{ background:"#111", border:`1px solid ${showSwap?"#d97706":"#1c1c1c"}`, borderRadius:10, padding:12, marginBottom: isSupersetChild?0:10, borderLeft:`3px solid ${isSupersetChild?"#3b82f6":color.bg}`, transition:"border-color 0.15s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
        {/* Tappable name opens swap */}
        <button onClick={()=>{ setShowSwap(s=>!s); setSwapSearch(""); }}
          style={{ flex:1, background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:17, color:showSwap?"#fbbf24":"#fff", letterSpacing:0.5, transition:"color 0.15s" }}>{ex.name}</span>
          <span style={{ fontSize:12, color:showSwap?"#d97706":"#2a2a2a" }}>⇄</span>
          {exNote && !showSwap && <span style={{ fontSize:11 }} title="Has note">📌</span>}
        </button>
        <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:doneSets===workingSets.length&&workingSets.length>0?"#4ade80":"#444" }}>{doneSets}/{workingSets.length}</span>
        {totalVol>0 && <span style={{ color:"#333", fontSize:11 }}>{Math.round(totalVol).toLocaleString()} lbs</span>}
        <button onClick={onRemove} style={{ background:"none", border:"none", color:"#2a2a2a", cursor:"pointer", fontSize:15 }}>🗑</button>
      </div>

      {/* ── Swap panel ── */}
      {showSwap && (
        <div style={{ background:"#0d0a00", border:"1px solid #d9770633", borderRadius:8, padding:10, marginBottom:10 }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#d97706", letterSpacing:2, marginBottom:6 }}>
            ⇄ SWAP · {swapInfo ? swapInfo.label : "Search below"}
          </div>
          <input
            value={swapSearch} onChange={e=>setSwapSearch(e.target.value)}
            placeholder="Search any exercise..."
            autoFocus
            style={{ width:"100%", background:"#111", border:"1px solid #d9770644", color:"#fff", borderRadius:6, padding:"7px 10px", fontSize:13, marginBottom:8, boxSizing:"border-box" }}
          />
          {allSwapOptions.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {!swapSearch && <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#555", letterSpacing:2, marginBottom:2 }}>SIMILAR EXERCISES — SETS KEPT</div>}
              {allSwapOptions.slice(0,7).map(name=>(
                <button key={name} onClick={()=>doSwap(name)}
                  style={{ background:"#161106", border:"1px solid #2a1a00", color:"#e8c97a", borderRadius:6, padding:"8px 12px", cursor:"pointer", textAlign:"left", fontFamily:"'Barlow Condensed', sans-serif", fontSize:14, fontWeight:700, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span>{name}</span>
                  <span style={{ color:"#554422", fontSize:11 }}>SWAP →</span>
                </button>
              ))}
            </div>
          )}
          {swapSearch && allSwapOptions.length === 0 && (
            <button onClick={()=>doSwap(swapSearch)}
              style={{ width:"100%", background:"#161106", border:"1px solid #d9770644", color:"#fbbf24", borderRadius:6, padding:"8px 12px", cursor:"pointer", textAlign:"left", fontFamily:"'Barlow Condensed', sans-serif", fontSize:14, fontWeight:700 }}>
              Use "{swapSearch}" →
            </button>
          )}
          <button onClick={()=>{ setShowSwap(false); setSwapSearch(""); }}
            style={{ marginTop:8, background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:11, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1 }}>CANCEL</button>
        </div>
      )}
      {/* ── Persistent exercise note ── */}
      {exNote && !showNoteEdit && (
        <div style={{ background:"#120e00", border:"1px solid #78350f44", borderRadius:6, padding:"6px 10px", marginBottom:8, display:"flex", alignItems:"flex-start", gap:8 }}>
          <span style={{ fontSize:13, flexShrink:0, marginTop:1 }}>📌</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#78350f", letterSpacing:2, marginBottom:2 }}>YOUR NOTE</div>
            <div style={{ color:"#d97706", fontSize:12, lineHeight:1.4 }}>{exNote}</div>
          </div>
          <button onClick={()=>{ setShowNoteEdit(true); setNoteInput(exNote); }}
            style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:11, fontFamily:"'Barlow Condensed', sans-serif", flexShrink:0 }}>EDIT</button>
        </div>
      )}

      {/* Note editor */}
      {showNoteEdit && (
        <div style={{ background:"#120e00", border:"1px solid #d9770644", borderRadius:6, padding:8, marginBottom:8 }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#d97706", letterSpacing:2, marginBottom:6 }}>📌 NOTE FOR {ex.name.toUpperCase()}</div>
          <textarea
            value={noteInput}
            onChange={e=>setNoteInput(e.target.value)}
            placeholder={`e.g. "Left shoulder tight — drop weight if needed" or "Best grip is just outside shoulder width"`}
            rows={3}
            autoFocus
            style={{ width:"100%", background:"#0d0a00", border:"1px solid #78350f", color:"#fbbf24", borderRadius:6, padding:"8px 10px", fontSize:13, fontFamily:"'Barlow', sans-serif", resize:"none", boxSizing:"border-box", lineHeight:1.4 }}
          />
          <div style={{ display:"flex", gap:6, marginTop:6 }}>
            <button onClick={()=>{ onSaveExNote(ex.name, noteInput.trim()); setShowNoteEdit(false); }}
              style={{ flex:2, background:"#78350f33", border:"1px solid #d97706", color:"#fbbf24", borderRadius:6, padding:"7px 0", cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, letterSpacing:1 }}>
              SAVE NOTE
            </button>
            {exNote && (
              <button onClick={()=>{ onSaveExNote(ex.name, ""); setShowNoteEdit(false); setNoteInput(""); }}
                style={{ flex:1, background:"none", border:"1px solid #2a2a2a", color:"#555", borderRadius:6, padding:"7px 0", cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontSize:12 }}>
                CLEAR
              </button>
            )}
            <button onClick={()=>setShowNoteEdit(false)}
              style={{ flex:1, background:"none", border:"none", color:"#444", cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontSize:12 }}>
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Add note button if none exists */}
      {!exNote && !showNoteEdit && !showSwap && (
        <button onClick={()=>{ setShowNoteEdit(true); setNoteInput(""); }}
          style={{ background:"none", border:"none", color:"#2a2a2a", cursor:"pointer", fontSize:11, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1, marginBottom:6, padding:0, display:"flex", alignItems:"center", gap:4 }}>
          <span>📌</span><span>add note for this exercise</span>
        </button>
      )}

      {/* Progressive overload suggestion */}
      {overloadSuggestion && !showSwap && (
        <div style={{ background: overloadSuggestion.type==="weight"?"#0a1a0a":"#0d0d1a", border:`1px solid ${overloadSuggestion.type==="weight"?"#16a34a44":"#2563eb44"}`, borderRadius:6, padding:"6px 10px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, color: overloadSuggestion.type==="weight"?"#4ade80":"#60a5fa", fontWeight:700 }}>
              {overloadSuggestion.type==="weight" ? "⬆ PROGRESS" : "💪 MATCH"} · {overloadSuggestion.msg}
            </div>
            <div style={{ color:"#444", fontSize:10 }}>{overloadSuggestion.detail} · {lastSession.date}</div>
          </div>
        </div>
      )}

      {lastSets.length > 0 && !overloadSuggestion && (
        <div style={{ color:"#2a2a2a", fontSize:10, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1, marginBottom:6 }}>
          LAST · {lastSession.date}
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:8 }}>
        {ex.sets.map((s,i)=>(
          <SetRow key={i} set={s} idx={i}
            onChange={v=>updSet(i,v)}
            onDel={()=>delSet(i)}
            isPR={setPRs[i]}
            ghost={lastSets[i] || null}
            onSetDone={(set)=>handleSetDone(set,i)}
          />
        ))}
      </div>
      {/* Set action buttons */}
      <div style={{ display:"flex", gap:5 }}>
        <button onClick={()=>smartAddSet()} style={{ flex:2, background: hint.type==="Drop Set"?"#1a0b0b":hint.type==="Superset"?"#0e1625":"#161616", border:`1px dashed ${hint.type==="Drop Set"?"#5a1111":hint.type==="Superset"?"#1e3a6e":"#2a2a2a"}`, color:hint.color, borderRadius:6, padding:"7px 0", fontSize:12, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:0.5, fontWeight:700 }}>
          {hint.label} <span style={{ color:"#555", fontSize:10, fontWeight:400 }}>smart</span>
        </button>
        {!isSupersetChild && <>
          <button onClick={()=>smartAddSet("Normal")} style={{ flex:1, background:"#161616", border:"1px dashed #2a2a2a", color:"#555", borderRadius:6, padding:"7px 0", fontSize:11, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:0.5 }}>NRM</button>
          <button onClick={()=>smartAddSet("Drop Set")} style={{ flex:1, background:"#1a0b0b", border:"1px dashed #5a1111", color:"#ef4444", borderRadius:6, padding:"7px 0", fontSize:11, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:0.5 }}>DRP</button>
          {otherExercises && otherExercises.length > 0 && (
            <button onClick={()=>setShowPairPicker(p=>!p)}
              style={{ flex:1, background: showPairPicker?"#1e3a6e":"#0e1625", border:"1px dashed #1e3a6e", color:"#60a5fa", borderRadius:6, padding:"7px 0", fontSize:11, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:0.5 }}>
              SS⚡
            </button>
          )}
        </>}
      </div>

      {/* Warm-up button — only on compound exercises, only if no warm-up set exists yet */}
      {!isSupersetChild && COMPOUND_NAMES.some(n=>ex.name.toLowerCase().includes(n.toLowerCase())) && !ex.sets.some(s=>s.warmup) && (
        <button onClick={()=>{
          const firstWorking = ex.sets.find(s=>!s.warmup);
          const suggestedW = firstWorking ? String(Math.round((parseFloat(firstWorking.w)||0)*0.5/5)*5) : "";
          // Insert warm-up before working sets
          onChange({ ...ex, sets:[{ w:suggestedW, r:"10", p:"", t:"Normal", done:false, warmup:true }, ...ex.sets] });
        }}
          style={{ width:"100%", marginTop:5, background:"#111", border:"1px dashed #333", color:"#555", borderRadius:6, padding:"5px 0", fontSize:11, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1 }}>
          + WARM-UP SET
        </button>
      )}

      {/* Pair picker */}
      {showPairPicker && otherExercises && (
        <div style={{ marginTop:8, background:"#0e1625", border:"1px solid #1e3a6e", borderRadius:8, padding:10 }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#60a5fa", letterSpacing:2, marginBottom:4 }}>PAIR WITH:</div>
          {getEquipment(ex.name) && (
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#3b82f6", letterSpacing:1, marginBottom:8 }}>
              ⚡ Same-equipment exercises shown first for efficient supersets
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {otherExercises.map(name => {
              const myEquip = getEquipment(ex.name);
              const theirEquip = getEquipment(name);
              const sameEquip = myEquip && theirEquip === myEquip;
              return (
                <button key={name} onClick={()=>{ onLinkSuperset(ex.name, name); setShowPairPicker(false); }}
                  style={{ background: sameEquip?"#0a1a2a":"#111", border:`1px solid ${sameEquip?"#3b82f6":"#1e3a6e"}`, color:"#93c5fd", borderRadius:6, padding:"8px 12px", cursor:"pointer", textAlign:"left", fontFamily:"'Barlow Condensed', sans-serif", fontSize:14, fontWeight:700, letterSpacing:0.5, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span>⚡ {name}</span>
                  {sameEquip && <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#3b82f6", background:"#1e3a6e33", padding:"2px 6px", borderRadius:3, letterSpacing:1 }}>SAME {myEquip.toUpperCase()}</span>}
                </button>
              );
            })}
          </div>
          <button onClick={()=>setShowPairPicker(false)} style={{ marginTop:8, background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:11, fontFamily:"'Barlow Condensed', sans-serif" }}>CANCEL</button>
        </div>
      )}
    </div>
  );
}

// ─── TODAY TAB ────────────────────────────────────────────────────
function TodayTab({ data, onSave, onSetProgram, onSaveExNote }) {
  const planned = (data.calendar||{})[TODAY];
  const logged = (data.history||[]).find(w=>w.date===TODAY);
  // Smart default: calendar plan > suggested next day > last workout's next in rotation > Push
  const smartDefault = planned || data.suggestedDay || "Push";
  const [mode, setMode] = useState("overview");
  const [exercises, setExercises] = useState([]);
  const [dayType, setDayType] = useState(smartDefault);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [adding, setAdding] = useState(false);
  const [customEx, setCustomEx] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [restTimer, setRestTimer] = useState(null); // { exName, setType }
  const [timerKey, setTimerKey] = useState(0); // increment to force RestTimer remount/reset
  const startRef = useRef(null);
  const history = data.history||[];

  // Timer
  useEffect(() => {
    let id;
    if (running) {
      if (!startRef.current) startRef.current = Date.now();
      id = setInterval(()=>setElapsed(Math.floor((Date.now()-startRef.current)/1000)),1000);
    }
    return ()=>clearInterval(id);
  },[running]);

  // Auto-load exercises whenever dayType changes or active program changes
  // Falls back to "PPL + Full Body" if no program is set yet
  useEffect(() => {
    if (mode === "active") return; // don't overwrite mid-workout
    const progName = data.activeProgram || "PPL + Full Body";
    const prog = PROGRAMS[progName] || PROGRAMS["PPL + Full Body"];
    if (!prog) return;
    const wkt = prog.workouts[dayType];
    if (!wkt) {
      setExercises([]);
      return;
    }
    setExercises(injectWarmups(wkt.exercises.map(e=>({...e, sets:e.sets.map(s=>({...s}))}))));
  }, [dayType, data.activeProgram, mode]);

  const loadProgram = (progName, wType) => {
    const prog = PROGRAMS[progName];
    if (!prog) return;
    const wkt = prog.workouts[wType];
    if (!wkt) return;
    setExercises(wkt.exercises.map(e=>({...e, sets:e.sets.map(s=>({...s}))})));
    setDayType(wType);
  };

  // Helper: get exercises for a given dayType from active program (or default to PPL+FB)
  // Auto-injects a warm-up set on compound exercises
  const injectWarmups = (exercises) => exercises.map(e => {
    const isCompound = COMPOUND_NAMES.some(n => e.name.toLowerCase().includes(n.toLowerCase()));
    if (!isCompound) return e;
    const hasWarmup = e.sets.some(s => s.warmup);
    if (hasWarmup) return e;
    return { ...e, sets: [{ w:"", r:"10", p:"", t:"Normal", done:false, warmup:true }, ...e.sets] };
  });

  const getExercisesForDay = (dt) => {
    const progName = data.activeProgram || "PPL + Full Body";
    const prog = PROGRAMS[progName] || PROGRAMS["PPL + Full Body"];
    const wkt = prog.workouts[dt] || Object.values(prog.workouts)[0];
    if (!wkt) return [];
    const raw = wkt.exercises.map(e=>({...e, sets:e.sets.map(s=>({...s}))}));
    return injectWarmups(raw);
  };

  const startWorkout = () => {
    // Always ensure exercises are loaded — pull from program if state is empty
    if (exercises.length === 0) {
      setExercises(getExercisesForDay(dayType));
    }
    startRef.current = Date.now();
    setRunning(true);
    setMode("active");
  };

  const addEx = (name) => {
    setExercises(ex=>[...ex,{name, notes:"", sets:[{w:"",r:"",p:"",t:"Normal"}]}]);
    setAdding(false); setCustomEx("");
  };

  const [workoutNote, setWorkoutNote] = useState("");

  const finish = () => {
    if (!exercises.length) return;
    const w = { date:TODAY, day:dayType, location, exercises, duration:elapsed, note:workoutNote };
    onSave(w);
    setExercises([]); setElapsed(0); setRunning(false); startRef.current=null;
    setWorkoutNote(""); setMode("done");
  };

  const mins=Math.floor(elapsed/60), secs=elapsed%60;
  const color = DAY_COLORS[dayType]||DAY_COLORS.Push;
  const libEx = ALL_EXERCISES[dayType]||[];
  const thisWeek = history.filter(w=>{ const d=new Date(w.date),n=new Date(); return (n-d)/(864e5)<7; }).length;

  if (mode==="done") {
    const next = data.nextPlanned;
    const nextColor = next ? DAY_COLORS[next.dayType] : null;
    return (
      <div style={{ textAlign:"center", padding:"40px 20px" }}>
        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:72, color:"#ef4444", lineHeight:1, letterSpacing:4 }}>DONE</div>
        <div style={{ color:"#555", fontSize:14, marginTop:8, marginBottom:28 }}>Workout saved. Rest up.</div>
        {next && nextColor && (
          <div style={{ background:nextColor.dim, border:`1px solid ${nextColor.bg}44`, borderRadius:10, padding:"14px 20px", marginBottom:20, textAlign:"left" }}>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#555", letterSpacing:2, marginBottom:4 }}>NEXT UP</div>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:32, fontWeight:900, color:nextColor.bg, letterSpacing:1 }}>{next.dayType.toUpperCase()}</div>
            <div style={{ color:"#666", fontSize:13, marginTop:2 }}>{next.date}</div>
            <div style={{ color:"#444", fontSize:11, marginTop:8 }}>
              {data.activeProgram
                ? `📋 Following ${data.activeProgram}`
                : `🧠 Inferred from your workout history`}
              {" · "}📅 Planned on your calendar
            </div>
          </div>
        )}
        <button onClick={()=>setMode("overview")} style={{ ...S.btn("#ef4444","#1c0808"), padding:"10px 28px", fontSize:15 }}>← BACK TO TODAY</button>
      </div>
    );
  }

  const [showLocPicker, setShowLocPicker] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  if (mode==="active") return (
    <div style={{ paddingTop: restTimer ? 68 : 0 }}>
      {/* Floating rest timer */}
      {restTimer && (
        <RestTimer
          key={timerKey}
          exName={restTimer.exName}
          setType={restTimer.setType}
          onDismiss={()=>setRestTimer(null)}
        />
      )}

      {/* Active header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: showLocPicker?6:8 }}>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:22, fontWeight:900, color:color.bg, letterSpacing:1 }}>{dayType.toUpperCase()}</div>
          <button onClick={()=>setShowLocPicker(p=>!p)}
            style={{ background:"none", border:"none", padding:0, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ color: showLocPicker?"#fbbf24":"#555", fontSize:12, fontFamily:"'Barlow Condensed', sans-serif" }}>{location.replace("Idaho Fitness Factory – ","IFF – ")}</span>
            <span style={{ color:"#333", fontSize:10 }}>▾</span>
          </button>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Plate calculator toggle */}
          <button onClick={()=>setShowCalc(c=>!c)}
            style={{ background: showCalc?"#1c1c1c":"#111", border:`1px solid ${showCalc?"#888":"#2a2a2a"}`, color: showCalc?"#fff":"#555", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, letterSpacing:0.5 }}>
            🏋️
          </button>
          <div style={{ fontFamily:"monospace", fontSize:22, color:"#4ade80", background:"#0d1a0f", padding:"4px 12px", borderRadius:6 }}>
            {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
          </div>
        </div>
      </div>

      {/* Inline plate calculator — slides in */}
      {showCalc && (
        <div style={{ marginBottom:10 }}>
          <PlateCalculator/>
        </div>
      )}

      {/* Location quick-picker */}
      {showLocPicker && (
        <div style={{ background:"#0d0d0d", border:"1px solid #1e1e1e", borderRadius:8, padding:10, marginBottom:12 }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, color:"#444", letterSpacing:2, marginBottom:6 }}>IDAHO FITNESS FACTORY</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
            {IFF_LOCATIONS.map(l=>(
              <button key={l} onClick={()=>{ setLocation(l); setShowLocPicker(false); }}
                style={{ background: location===l?"#1c0808":"#161616", border:`1px solid ${location===l?"#ef4444":"#2a2a2a"}`, color: location===l?"#ef4444":"#888", borderRadius:5, padding:"5px 10px", fontSize:11, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700 }}>
                {l.replace("Idaho Fitness Factory – ","")}
              </button>
            ))}
          </div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, color:"#444", letterSpacing:2, marginBottom:6 }}>HOTEL</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {HOTEL_LOCATIONS.map(l=>(
              <button key={l} onClick={()=>{ setLocation(l); setShowLocPicker(false); }}
                style={{ background: location===l?"#0a1a14":"#161616", border:`1px solid ${location===l?"#059669":"#2a2a2a"}`, color: location===l?"#4ade80":"#888", borderRadius:5, padding:"5px 10px", fontSize:11, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700 }}>
                {l.replace(" Gym","")}
              </button>
            ))}
            {["Home","Other"].map(l=>(
              <button key={l} onClick={()=>{ setLocation(l); setShowLocPicker(false); }}
                style={{ background: location===l?"#1a1a1a":"#161616", border:`1px solid ${location===l?"#888":"#2a2a2a"}`, color: location===l?"#ccc":"#555", borderRadius:5, padding:"5px 10px", fontSize:11, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700 }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Day type swap */}
      <div style={{ display:"flex", gap:5, marginBottom:12, flexWrap:"wrap" }}>
        {Object.keys(DAY_COLORS).filter(d=>d!=="Rest").map(d=>(
          <button key={d} onClick={()=>setDayType(d)} style={{ padding:"4px 10px", borderRadius:5, border:"none", background:dayType===d?DAY_COLORS[d].bg:"#1a1a1a", color:dayType===d?"#fff":DAY_COLORS[d].light, fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:0.5 }}>{d}</button>
        ))}
      </div>

      {/* Render exercises — group superset pairs together */}
      {(()=>{
        const rendered = new Set();
        return exercises.map((ex, i) => {
          if (rendered.has(ex.name)) return null;
          const pairIdx = ex.supersetWith ? exercises.findIndex(e=>e.name===ex.supersetWith) : -1;
          const pair = pairIdx >= 0 ? exercises[pairIdx] : null;

          if (pair && !rendered.has(pair.name)) {
            rendered.add(ex.name); rendered.add(pair.name);
            return (
              <SupersetBracket key={ex.name+pair.name}
                exA={ex} exB={pair}
                onChangeA={v=>setExercises(e=>e.map((x,j)=>j===i?v:x))}
                onChangeB={v=>setExercises(e=>e.map((x,j)=>j===pairIdx?v:x))}
                onRemoveA={()=>setExercises(e=>{ const n=e.filter((_,j)=>j!==i); return n.map(x=>x.supersetWith===ex.name?{...x,supersetWith:null}:x); })}
                onRemoveB={()=>setExercises(e=>{ const n=e.filter((_,j)=>j!==pairIdx); return n.map(x=>x.supersetWith===pair.name?{...x,supersetWith:null}:x); })}
                onUnlink={()=>setExercises(e=>e.map(x=>x.name===ex.name||x.name===pair.name?{...x,supersetWith:null}:x))}
                history={history} dayType={dayType}
                onStartRest={(exName, setType) => { setRestTimer({ exName, setType }); setTimerKey(k=>k+1); }}
              />
            );
          }

          rendered.add(ex.name);
          return (
            <ExerciseBlock key={i} ex={ex}
              onChange={v=>setExercises(e=>e.map((x,j)=>j===i?v:x))}
              onRemove={()=>setExercises(e=>e.filter((_,j)=>j!==i))}
              history={history} dayType={dayType}
              onStartRest={(exName, setType) => { setRestTimer({ exName, setType }); setTimerKey(k=>k+1); }}
              otherExercises={getSupersetSuggestions(ex.name, exercises.filter(e=>e.name!==ex.name&&!e.supersetWith).map(e=>e.name))}
              onLinkSuperset={(nameA, nameB) => {
                setExercises(e => e.map(x =>
                  x.name===nameA ? {...x, supersetWith:nameB} :
                  x.name===nameB ? {...x, supersetWith:nameA} : x
                ));
              }}
              exNote={(data.exerciseNotes||{})[ex.name] || ""}
              onSaveExNote={onSaveExNote}
            />
          );
        });
      })()}

      <button onClick={()=>setAdding(a=>!a)} style={{ width:"100%", background:"#111", border:"1px dashed #2a2a2a", color:"#666", borderRadius:8, padding:"10px 0", fontSize:13, cursor:"pointer", marginBottom:8, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1 }}>
        {adding?"▲ CLOSE":"+ ADD EXERCISE"}
      </button>

      {adding && (
        <div style={{ background:"#0d0d0d", border:"1px solid #1c1c1c", borderRadius:8, padding:12, marginBottom:12 }}>
          <div style={{ display:"flex", gap:6, marginBottom:8 }}>
            <input value={customEx} onChange={e=>setCustomEx(e.target.value)} placeholder="Custom exercise..." style={{ flex:1, ...S.input }}/>
            <button onClick={()=>customEx.trim()&&addEx(customEx.trim())} style={{ ...S.btn("#4ade80","#0a1a0f") }}>ADD</button>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {libEx.map(n=><button key={n} onClick={()=>addEx(n)} style={{ background:"#161616", border:"1px solid #222", color:"#ccc", borderRadius:5, padding:"4px 9px", fontSize:11, cursor:"pointer", fontFamily:"'Barlow', sans-serif" }}>{n}</button>)}
          </div>
        </div>
      )}

      {/* Workout notes */}
      <div style={{ marginTop:8, marginBottom:8 }}>
        <textarea
          value={workoutNote}
          onChange={e=>setWorkoutNote(e.target.value)}
          placeholder="Session notes... (how you felt, what to improve, PRs attempted)"
          rows={2}
          style={{ width:"100%", background:"#111", border:"1px solid #2a2a2a", color:"#888", borderRadius:8, padding:"10px 12px", fontSize:13, fontFamily:"'Barlow', sans-serif", resize:"none", boxSizing:"border-box" }}
        />
      </div>

      <button onClick={finish} style={{ width:"100%", background:color.bg, color:"#fff", border:"none", borderRadius:8, padding:"14px 0", fontFamily:"'Barlow Condensed', sans-serif", fontSize:24, fontWeight:900, letterSpacing:3, cursor:"pointer" }}>
        FINISH WORKOUT
      </button>
    </div>
  );

  // Overview
  return (
    <div>
      {/* Stats strip */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <div style={{ flex:1, background:"#111", border:"1px solid #1c1c1c", borderRadius:8, padding:"9px 10px" }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:20, fontWeight:700, color:"#ef4444", lineHeight:1 }}>{thisWeek}/4</div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#444", letterSpacing:1, marginTop:1 }}>THIS WEEK</div>
        </div>
        <div style={{ flex:1, background:"#111", border:"1px solid #1c1c1c", borderRadius:8, padding:"9px 10px" }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:20, fontWeight:700, color:"#60a5fa", lineHeight:1 }}>{history.length}</div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#444", letterSpacing:1, marginTop:1 }}>TOTAL</div>
        </div>
        <div style={{ flex:2, background:"#111", border:"1px solid #1c1c1c", borderRadius:8, padding:"9px 10px" }}>
          <select value={location} onChange={e=>setLocation(e.target.value)}
            style={{ width:"100%", background:"transparent", color:"#4ade80", border:"none", fontSize:11, fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, outline:"none" }}>
            {LOCATIONS.map(l=><option key={l} style={{ background:"#111" }}>{l}</option>)}
          </select>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#444", letterSpacing:1, marginTop:1 }}>LOCATION</div>
        </div>
      </div>

      {/* Program first-time prompt */}
      {!data.activeProgram && (
        <div style={{ ...S.card, border:"1px solid #fbbf2444", background:"#0d0a00", marginBottom:10 }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#fbbf24", letterSpacing:2, marginBottom:6 }}>⚡ SET YOUR PROGRAM ONCE</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {Object.entries(PROGRAMS).map(([name,prog])=>(
              <button key={name} onClick={()=>onSetProgram(name)}
                style={{ background:prog.color+"22", border:`1px solid ${prog.color}55`, color:prog.color, borderRadius:6, padding:"5px 10px", fontSize:11, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700 }}>
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main workout card */}
      <div style={S.card}>
        {/* Program badge */}
        {data.activeProgram && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, color:PROGRAMS[data.activeProgram]?.color||"#666", letterSpacing:1, background:(PROGRAMS[data.activeProgram]?.color||"#666")+"22", padding:"3px 8px", borderRadius:4 }}>
              ▶ {data.activeProgram}
            </span>
            <button onClick={()=>onSetProgram(null)} style={{ background:"none", border:"none", color:"#333", fontSize:10, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif" }}>change</button>
          </div>
        )}

        {/* Day selector */}
        <div style={{ display:"flex", gap:5, marginBottom:12, flexWrap:"wrap" }}>
          {Object.keys(DAY_COLORS).filter(d=>d!=="Rest").map(d=>(
            <button key={d} onClick={()=>setDayType(d)}
              style={{ padding:"7px 12px", borderRadius:6, border:`2px solid ${dayType===d?DAY_COLORS[d].bg:"transparent"}`, background:dayType===d?DAY_COLORS[d].bg+"22":"#1a1a1a", color:dayType===d?DAY_COLORS[d].bg:DAY_COLORS[d].light, fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, cursor:"pointer" }}>{d}</button>
          ))}
          <button onClick={()=>setDayType("Rest")}
            style={{ padding:"7px 12px", borderRadius:6, border:`2px solid ${dayType==="Rest"?"#374151":"transparent"}`, background:"#1a1a1a", color:"#555", fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, cursor:"pointer" }}>Rest</button>
        </div>

        {/* Exercise preview */}
        {exercises.length > 0 && dayType !== "Rest" && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, color:color.bg, letterSpacing:2, marginBottom:5 }}>✓ {exercises.length} EXERCISES READY</div>
            {exercises.map((ex,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #161616" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:4, height:4, borderRadius:"50%", background:color.bg, display:"inline-block" }}/>
                  <span style={{ color:"#bbb", fontSize:12 }}>{ex.name}</span>
                </div>
                <span style={{ color:"#333", fontSize:11 }}>{ex.sets.length} sets</span>
              </div>
            ))}
          </div>
        )}

        {/* Start button */}
        {dayType !== "Rest" ? (
          <button onClick={startWorkout}
            style={{ width:"100%", background:color.bg, color:"#fff", border:"none", borderRadius:8, padding:"15px 0", fontFamily:"'Barlow Condensed', sans-serif", fontSize:26, fontWeight:900, letterSpacing:3, cursor:"pointer" }}>
            ▶ START {dayType.toUpperCase()}
          </button>
        ) : (
          <div style={{ textAlign:"center", padding:16, color:"#555", fontFamily:"'Barlow Condensed', sans-serif", fontSize:18, letterSpacing:2 }}>REST DAY — RECOVER 💤</div>
        )}
      </div>

      {/* Fitness trackers — compact */}
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <a href="fitbit://" style={{ flex:1, display:"block", background:"#0a1a14", border:"1px solid #00b0b933", color:"#00b0b9", borderRadius:7, padding:"8px 0", textAlign:"center", textDecoration:"none", fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, fontWeight:700, letterSpacing:1 }}>📊 FITBIT</a>
        <a href="googlefit://" style={{ flex:1, display:"block", background:"#0a1020", border:"1px solid #4285f433", color:"#4285f4", borderRadius:7, padding:"8px 0", textAlign:"center", textDecoration:"none", fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, fontWeight:700, letterSpacing:1 }}>🏃 GOOGLE FIT</a>
      </div>

      {/* Status cards */}
      {logged && (
        <div style={{ ...S.card, borderLeft:"3px solid #4ade80", padding:"10px 14px" }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, color:"#4ade80", letterSpacing:2, marginBottom:2 }}>✓ TODAY LOGGED</div>
          <div style={{ color:"#777", fontSize:12 }}>{logged.day} · {(logged.exercises||[]).length} exercises · {Math.floor((logged.duration||0)/60)}m</div>
          {logged.note && <div style={{ color:"#555", fontSize:11, marginTop:4, fontStyle:"italic" }}>"{logged.note}"</div>}
        </div>
      )}
      {data.nextPlanned && (
        <div style={{ ...S.card, borderLeft:`3px solid ${DAY_COLORS[data.nextPlanned.dayType]?.bg||"#666"}`, padding:"10px 14px" }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, color:"#555", letterSpacing:2, marginBottom:2 }}>NEXT UP</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:18, color:DAY_COLORS[data.nextPlanned.dayType]?.bg||"#ccc" }}>{data.nextPlanned.dayType.toUpperCase()}</span>
            <span style={{ color:"#555", fontSize:12 }}>{data.nextPlanned.date}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CALENDAR TAB ─────────────────────────────────────────────────
function CalendarTab({ data, onPlan }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sel, setSel] = useState(null);

  const dim = daysInMonth(year, month);
  const fd = firstDay(year, month);
  const days = Array(fd).fill(null).concat(Array.from({length:dim},(_,i)=>i+1));
  const calendar = data.calendar||{};
  const history = data.history||[];

  const prevMonth = () => { if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };

  const getDateStr = (d) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const selDate = sel ? getDateStr(sel) : null;
  const selLogged = selDate ? history.find(w=>w.date===selDate) : null;
  const selPlanned = selDate ? calendar[selDate] : null;

  return (
    <div>
      {/* Month nav */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <button onClick={prevMonth} style={{ ...S.btn("#888","#111"), padding:"6px 14px", fontSize:18 }}>‹</button>
        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:22, letterSpacing:2, color:"#fff" }}>{MONTHS[month]} {year}</div>
        <button onClick={nextMonth} style={{ ...S.btn("#888","#111"), padding:"6px 14px", fontSize:18 }}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
          <div key={d} style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#444", textAlign:"center", letterSpacing:1, padding:"4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:16 }}>
        {days.map((d,i)=>{
          if (!d) return <div key={i}/>;
          const ds = getDateStr(d);
          const planned = calendar[ds];
          const logged = history.find(w=>w.date===ds);
          const isToday = ds===TODAY;
          const isSel = sel===d;
          const color = logged ? DAY_COLORS[logged.day] : planned ? DAY_COLORS[planned] : null;
          return (
            <div key={i} onClick={()=>setSel(isSel?null:d)}
              style={{ background: isSel?"#1c1c1c":color?color.dim:"#111", border:isToday?"1px solid #ef4444":isSel?"1px solid #555":"1px solid #1a1a1a", borderRadius:7, padding:"8px 4px", textAlign:"center", cursor:"pointer", position:"relative", minHeight:46 }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:14, fontWeight:isToday?900:400, color:isToday?"#ef4444":"#ccc" }}>{d}</div>
              {(logged||planned) && (
                <div style={{ width:6, height:6, borderRadius:"50%", background: logged?color.bg:color.bg+"88", margin:"2px auto 0" }}/>
              )}
              {logged && <div style={{ fontSize:8, color:color.light, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:0.5, marginTop:1 }}>{logged.day.slice(0,2).toUpperCase()}</div>}
              {!logged && planned && <div style={{ fontSize:8, color:color.bg+"88", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:0.5, marginTop:1 }}>{planned.slice(0,2).toUpperCase()}</div>}
            </div>
          );
        })}
      </div>

      {/* Selected day detail */}
      {sel && selDate && (
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:15, color:"#fff", letterSpacing:1 }}>
              {MONTHS[month]} {sel}
              {selDate===TODAY && <span style={{ color:"#ef4444", fontSize:12, marginLeft:8 }}>TODAY</span>}
            </div>
            {selPlanned && !selLogged && (
              <button onClick={()=>onPlan(selDate, null)}
                style={{ background:"#1a0808", border:"1px solid #3f1212", color:"#f87171", borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, letterSpacing:0.5 }}>
                CLEAR
              </button>
            )}
          </div>
          {selLogged ? (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#4ade80", letterSpacing:2, marginBottom:4 }}>✓ COMPLETED</div>
              <div style={{ color:"#888", fontSize:13 }}>{selLogged.day} · {selLogged.location} · {(selLogged.exercises||[]).length} exercises</div>
              <div style={{ color:"#555", fontSize:12 }}>{Math.floor((selLogged.duration||0)/60)}m {(selLogged.duration||0)%60}s</div>
            </div>
          ) : (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#555", letterSpacing:2, marginBottom:6 }}>
                {selPlanned ? "CHANGE PLAN" : "PLAN THIS DAY"}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {Object.keys(DAY_COLORS).map(t=>(
                  <button key={t} onClick={()=>onPlan(selDate,t)}
                    style={{ padding:"6px 12px", borderRadius:6, border: selPlanned===t?`2px solid ${DAY_COLORS[t].bg}`:"1px solid transparent", background: selPlanned===t?DAY_COLORS[t].bg:DAY_COLORS[t].dim, color: selPlanned===t?"#fff":DAY_COLORS[t].light, fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:0.5 }}>
                    {selPlanned===t ? "✓ " : ""}{t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, padding:"4px 0" }}>
        {Object.entries(DAY_COLORS).map(([t,c])=>(
          <div key={t} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:c.bg }}/>
            <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#555", letterSpacing:0.5 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROGRAMS TAB ─────────────────────────────────────────────────
function ProgramsTab({ data, onPlan }) {
  const [sel, setSel] = useState(null);
  const [selEx, setSelEx] = useState(null);
  const [applyWeek, setApplyWeek] = useState(false);

  const applyToCalendar = (progName) => {
    const prog = PROGRAMS[progName];
    const today = new Date();
    const dayOfWeek = today.getDay();
    prog.schedule.forEach((dayType, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - dayOfWeek + i);
      onPlan(ymd(d), dayType);
    });
    setApplyWeek(progName);
    setTimeout(()=>setApplyWeek(false), 2000);
  };

  if (selEx) {
    const prog = PROGRAMS[sel];
    const ex = prog.workouts[selEx];
    return (
      <div>
        <button onClick={()=>setSelEx(null)} style={{ background:"none", border:"none", color:"#60a5fa", cursor:"pointer", fontSize:13, marginBottom:12, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1 }}>← BACK</button>
        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:22, color:"#fff", marginBottom:4, letterSpacing:1 }}>{ex.name}</div>
        <div style={{ color:"#555", fontSize:13, marginBottom:14 }}>Preview — weights blank until you log it</div>
        {ex.exercises.map((e,i)=>(
          <div key={i} style={{ background:"#111", border:"1px solid #1c1c1c", borderRadius:8, padding:12, marginBottom:8 }}>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:16, color:"#fff", marginBottom:4 }}>{e.name}</div>
            {e.notes && <div style={{ color:"#555", fontSize:11, fontStyle:"italic", marginBottom:4 }}>{e.notes}</div>}
            {e.sets.map((s,j)=>(
              <div key={j} style={{ display:"flex", gap:10, color:"#666", fontSize:12, padding:"2px 0" }}>
                <span style={{ color:"#333", minWidth:20 }}>{j+1}.</span>
                <span style={{ color:s.t==="Superset"?"#3b82f6":s.t==="Drop Set"?"#ef4444":"#555" }}>{s.t}</span>
                <span>— × {s.r} reps{s.p?` +${s.p}½`:""}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (sel) {
    const prog = PROGRAMS[sel];
    return (
      <div>
        <button onClick={()=>setSel(null)} style={{ background:"none", border:"none", color:"#60a5fa", cursor:"pointer", fontSize:13, marginBottom:12, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1 }}>← BACK</button>
        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:24, color:prog.color, marginBottom:4, letterSpacing:1 }}>{sel}</div>
        <div style={{ color:"#666", fontSize:13, marginBottom:16 }}>{prog.description}</div>

        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#444", letterSpacing:2, marginBottom:8 }}>WEEKLY SCHEDULE</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:16 }}>
          {["S","M","T","W","T","F","S"].map((d,i)=>{
            const t = prog.schedule[i];
            const c = DAY_COLORS[t];
            return (
              <div key={i} style={{ background:c.dim, border:`1px solid ${c.bg}44`, borderRadius:5, padding:"8px 2px", textAlign:"center" }}>
                <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, color:"#555", letterSpacing:1 }}>{d}</div>
                <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, fontWeight:700, color:c.light, marginTop:2 }}>{t.slice(0,3).toUpperCase()}</div>
              </div>
            );
          })}
        </div>

        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#444", letterSpacing:2, marginBottom:8 }}>WORKOUTS</div>
        {Object.keys(prog.workouts).map(wType=>(
          <div key={wType} onClick={()=>setSelEx(wType)} style={{ background:"#111", border:"1px solid #1c1c1c", borderRadius:8, padding:"12px 14px", marginBottom:8, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:16, color:"#fff" }}>{prog.workouts[wType].name}</div>
              <div style={{ color:"#555", fontSize:12 }}>{prog.workouts[wType].exercises.length} exercises</div>
            </div>
            <span style={{ color:"#444", fontSize:18 }}>›</span>
          </div>
        ))}

        <button onClick={()=>applyToCalendar(sel)} style={{ width:"100%", marginTop:8, background: applyWeek===sel?"#14532d":"#0d1a0f", border:`1px solid ${applyWeek===sel?"#4ade80":"#16a34a"}`, color:applyWeek===sel?"#4ade80":"#16a34a", borderRadius:8, padding:"12px 0", fontFamily:"'Barlow Condensed', sans-serif", fontSize:16, fontWeight:700, letterSpacing:2, cursor:"pointer" }}>
          {applyWeek===sel?"✓ APPLIED TO CALENDAR":"📅 APPLY TO THIS WEEK"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={S.sectionTitle}>PROGRAMS</div>
      {Object.entries(PROGRAMS).map(([name,prog])=>(
        <div key={name} onClick={()=>setSel(name)} style={{ background:"#111", border:`1px solid #1c1c1c`, borderRadius:10, padding:14, marginBottom:10, cursor:"pointer", borderLeft:`4px solid ${prog.color}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:18, color:"#fff", letterSpacing:0.5 }}>{name}</div>
              <div style={{ color:"#666", fontSize:12, marginTop:3, maxWidth:280 }}>{prog.description}</div>
            </div>
            <span style={{ color:"#444", fontSize:20 }}>›</span>
          </div>
          <div style={{ display:"flex", gap:4, marginTop:10, flexWrap:"wrap" }}>
            {Object.keys(prog.workouts).map(t=>(
              <span key={t} style={{ background:DAY_COLORS[t].dim, color:DAY_COLORS[t].light, borderRadius:4, padding:"2px 8px", fontSize:11, fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, letterSpacing:0.5 }}>{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── LOG TAB ──────────────────────────────────────────────────────
function LogTab({ data, onDelete }) {
  const history = data.history||[];
  const [sel, setSel] = useState(null);

  if (sel!==null) {
    const w = history[sel];
    const color = DAY_COLORS[w.day]||DAY_COLORS.Push;
    return (
      <div>
        <button onClick={()=>setSel(null)} style={{ background:"none", border:"none", color:"#60a5fa", cursor:"pointer", fontSize:13, marginBottom:12, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1 }}>← LOG BOOK</button>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:26, color:color.bg, letterSpacing:1 }}>{w.day.toUpperCase()}</div>
            <div style={{ color:"#555", fontSize:12 }}>{w.date} · {w.location}</div>
            {w.duration && <div style={{ color:"#444", fontSize:12 }}>{Math.floor(w.duration/60)}m {w.duration%60}s</div>}
          {w.note && (
            <div style={{ background:"#161616", border:"1px solid #222", borderRadius:6, padding:"8px 10px", marginTop:8 }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, color:"#555", letterSpacing:2, marginBottom:3 }}>SESSION NOTE</div>
              <div style={{ color:"#888", fontSize:13 }}>{w.note}</div>
            </div>
          )}
          </div>
          <button onClick={()=>{onDelete(sel);setSel(null);}} style={{ ...S.btn("#f87171","#1a0808"), fontSize:11 }}>DELETE</button>
        </div>
        {(w.exercises||[]).map((ex,i)=>{
          const totalV = Math.round(vol(ex.sets||[]));
          return (
            <div key={i} style={{ background:"#111", border:`1px solid #1c1c1c`, borderRadius:8, padding:12, marginBottom:8, borderLeft:`3px solid ${color.bg}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:15, color:"#fff" }}>{ex.name}</div>
                {totalV>0&&<div style={{ color:"#555", fontSize:11 }}>{totalV.toLocaleString()} lbs</div>}
              </div>
              {(ex.sets||[]).map((s,j)=>(
                <div key={j} style={{ display:"flex", gap:10, color:"#666", fontSize:12, padding:"3px 0", borderBottom:"1px solid #161616" }}>
                  <span style={{ color:"#333", minWidth:20 }}>{j+1}.</span>
                  <span style={{ color:s.t==="Superset"?"#3b82f6":s.t==="Drop Set"?"#ef4444":"#555" }}>{s.t||"Normal"}</span>
                  <span style={{ color:"#ccc" }}>{s.w} lbs × {s.r} reps{parseInt(s.p)>0?<span style={{color:"#a78bfa"}}> +{s.p}½</span>:null}</span>
                  {(()=>{ const v=e1rm(s.w,s.r); const pb=Math.max(0,...history.slice(0,sel).flatMap(d=>(d.exercises||[]).filter(e=>e.name===ex.name).flatMap(e=>(e.sets||[]).map(s2=>e1rm(s2.w,s2.r))))); return v>0&&v>pb?<PRBadge/>:null; })()}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div style={S.sectionTitle}>LOG BOOK</div>
      {history.length===0&&<div style={{ color:"#444", fontSize:14, textAlign:"center", padding:40 }}>No workouts logged yet.</div>}
      {[...history].reverse().map((w,ri)=>{
        const i=history.length-1-ri;
        const totalV = Math.round((w.exercises||[]).reduce((a,e)=>a+vol(e.sets||[]),0));
        const color = DAY_COLORS[w.day]||DAY_COLORS.Push;
        return (
          <div key={i} onClick={()=>setSel(i)} style={{ background:"#111", border:"1px solid #1c1c1c", borderRadius:8, padding:"12px 14px", marginBottom:8, cursor:"pointer", display:"flex", gap:12, alignItems:"center", borderLeft:`3px solid ${color.bg}` }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:16, color:color.bg }}>{w.day.toUpperCase()}</span>
                {w.date===TODAY && <span style={{ background:"#ef4444", color:"#fff", fontSize:9, padding:"1px 5px", borderRadius:2, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1 }}>TODAY</span>}
              </div>
              <div style={{ color:"#555", fontSize:11 }}>{w.date} · {(w.location||"").split("–")[0].trim()} · {(w.exercises||[]).length} ex</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:18, color:"#ccc", fontWeight:700 }}>{totalV.toLocaleString()}</div>
              <div style={{ color:"#444", fontSize:10 }}>lbs vol</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Plate Calculator ────────────────────────────────────────────
const PLATES = [45, 35, 25, 10, 5, 2.5];
const PLATE_COLORS = { 45:"#dc2626", 35:"#2563eb", 25:"#16a34a", 10:"#ca8a04", 5:"#9333ea", 2.5:"#0891b2" };

function PlateCalculator() {
  const [target, setTarget] = useState("");
  const [barWeight, setBarWeight] = useState(45);

  const calcPlates = (totalWeight, bar) => {
    let remaining = (totalWeight - bar) / 2;
    if (remaining < 0) return null;
    const result = [];
    for (const plate of PLATES) {
      const count = Math.floor(remaining / plate);
      if (count > 0) { result.push({ plate, count }); remaining = Math.round((remaining - plate * count) * 100) / 100; }
    }
    if (remaining > 0.01) return null;
    return result;
  };

  const totalWeight = parseFloat(target) || 0;
  const plates = totalWeight >= barWeight ? calcPlates(totalWeight, barWeight) : null;
  const canMake = plates !== null;
  const platesWeight = plates ? plates.reduce((a,{plate,count})=>a+plate*count*2, 0) : 0;
  const nearestBelow = (() => {
    if (!target || canMake) return null;
    for (let w = totalWeight - 2.5; w >= barWeight; w -= 2.5) {
      const p = calcPlates(w, barWeight);
      if (p !== null) return { weight: w, plates: p };
    }
    return null;
  })();

  return (
    <div style={S.card}>
      <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, color:"#444", letterSpacing:2, marginBottom:12 }}>🏋️ PLATE CALCULATOR</div>

      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, color:"#555", letterSpacing:1, marginBottom:4 }}>TARGET WEIGHT (lbs)</div>
          <input type="number" placeholder="185" value={target} onChange={e=>setTarget(e.target.value)}
            style={{ width:"100%", background:"#0d0d0d", color:"#fff", border:"1px solid #2a2a2a", borderRadius:6, padding:"10px 12px", fontSize:26, fontWeight:700, textAlign:"center", boxSizing:"border-box" }}/>
        </div>
        <div style={{ width:95 }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, color:"#555", letterSpacing:1, marginBottom:4 }}>BAR WEIGHT</div>
          <select value={barWeight} onChange={e=>setBarWeight(Number(e.target.value))}
            style={{ width:"100%", height:52, background:"#0d0d0d", color:"#888", border:"1px solid #2a2a2a", borderRadius:6, padding:"4px 8px", fontSize:14, fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700 }}>
            <option value={45}>45 lb</option>
            <option value={35}>35 lb</option>
            <option value={15}>15 lb</option>
            <option value={0}>No bar</option>
          </select>
        </div>
      </div>

      {totalWeight > 0 && totalWeight < barWeight && (
        <div style={{ color:"#f87171", fontSize:13, textAlign:"center", padding:10 }}>Must be more than bar weight ({barWeight} lbs)</div>
      )}

      {plates && plates.length === 0 && totalWeight === barWeight && (
        <div style={{ textAlign:"center", padding:12, background:"#161616", borderRadius:8 }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:22, color:"#888" }}>BAR ONLY — {barWeight} lbs</div>
        </div>
      )}

      {plates && plates.length > 0 && (
        <div>
          {/* 3-column breakdown: Bar | Each Side | Total */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:14 }}>
            <div style={{ background:"#222", borderRadius:7, padding:"8px 6px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:22, fontWeight:900, color:"#aaa" }}>{barWeight}</div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#666", letterSpacing:1 }}>BAR</div>
            </div>
            <div style={{ background:"#0e1625", border:"1px solid #1e3a6e", borderRadius:7, padding:"8px 6px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:22, fontWeight:900, color:"#60a5fa" }}>{platesWeight/2}</div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#3b82f6", letterSpacing:1 }}>EACH SIDE</div>
            </div>
            <div style={{ background:"#1a0808", border:"1px solid #ef4444", borderRadius:7, padding:"8px 6px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:22, fontWeight:900, color:"#ef4444" }}>{totalWeight}</div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#ef444488", letterSpacing:1 }}>TOTAL</div>
            </div>
          </div>

          {/* Full bar visual — both sides */}
          <div style={{ overflowX:"auto", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:1, minWidth:"max-content", margin:"0 auto" }}>
              {/* Left collar */}
              <div style={{ width:10, height:20, background:"#555", borderRadius:"2px 0 0 2px", flexShrink:0 }}/>
              {/* Left plates */}
              {plates.map(({plate, count}) =>
                Array.from({length:count}).map((_,i) => (
                  <div key={`L${plate}-${i}`} style={{ width:plate>=45?12:plate>=25?10:plate>=10?9:7, height:plate>=45?54:plate>=25?46:plate>=10?36:26, background:PLATE_COLORS[plate]||"#888", borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,0.15)", flexShrink:0 }}>
                    <span style={{ color:"rgba(255,255,255,0.9)", fontSize:6, fontWeight:900, writingMode:"vertical-rl", fontFamily:"'Barlow Condensed', sans-serif" }}>{plate}</span>
                  </div>
                ))
              )}
              {/* Bar sleeve */}
              <div style={{ width:36, height:12, background:"#777", borderRadius:1, flexShrink:0 }}/>
              {/* Right plates (mirrored) */}
              {[...plates].reverse().map(({plate, count}) =>
                Array.from({length:count}).map((_,i) => (
                  <div key={`R${plate}-${i}`} style={{ width:plate>=45?12:plate>=25?10:plate>=10?9:7, height:plate>=45?54:plate>=25?46:plate>=10?36:26, background:PLATE_COLORS[plate]||"#888", borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,0.15)", flexShrink:0 }}>
                    <span style={{ color:"rgba(255,255,255,0.9)", fontSize:6, fontWeight:900, writingMode:"vertical-rl", fontFamily:"'Barlow Condensed', sans-serif" }}>{plate}</span>
                  </div>
                ))
              )}
              {/* Right collar */}
              <div style={{ width:10, height:20, background:"#555", borderRadius:"0 2px 2px 0", flexShrink:0 }}/>
            </div>
          </div>

          {/* Plate list */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {plates.map(({plate, count}) => (
              <div key={plate} style={{ background:PLATE_COLORS[plate]+"22", border:`1px solid ${PLATE_COLORS[plate]}55`, borderRadius:6, padding:"5px 10px", display:"flex", gap:5, alignItems:"center" }}>
                <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:20, fontWeight:900, color:PLATE_COLORS[plate] }}>{count}×</span>
                <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, color:"#ccc", fontWeight:700 }}>{plate} lb</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!canMake && totalWeight > barWeight && nearestBelow && (
        <div style={{ marginTop:10, background:"#1a1008", border:"1px solid #ca8a0444", borderRadius:8, padding:10 }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:"#ca8a04", letterSpacing:2, marginBottom:6 }}>CAN'T MAKE EXACT — NEAREST:</div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:22, color:"#fbbf24", fontWeight:900, marginBottom:6 }}>{nearestBelow.weight} lbs</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {nearestBelow.plates.map(({plate,count})=>(
              <span key={plate} style={{ background:PLATE_COLORS[plate]+"22", color:PLATE_COLORS[plate], borderRadius:5, padding:"3px 8px", fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700 }}>{count}×{plate}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GAINS TAB ───────────────────────────────────────────────────
function GainsTab({ data }) {
  const history = data.history||[];
  const [filterEx, setFilterEx] = useState("");
  const [selEx, setSelEx] = useState(null);

  const allNames = [...new Set(history.flatMap(d=>(d.exercises||[]).map(e=>e.name)))].sort();
  const filtered = filterEx ? allNames.filter(n=>n.toLowerCase().includes(filterEx.toLowerCase())) : allNames;

  const prMap = {};
  history.forEach((w,wi)=>(w.exercises||[]).forEach(ex=>(ex.sets||[]).forEach(s=>{
    const v=e1rm(s.w,s.r);
    if (!prMap[ex.name]||v>prMap[ex.name].val) prMap[ex.name]={val:v,date:w.date,weight:s.w,reps:s.r};
  })));

  // Volume by month
  const monthVol = {};
  history.forEach(w=>{ const mk=w.date?w.date.slice(0,7):"?"; monthVol[mk]=(monthVol[mk]||0)+(w.exercises||[]).reduce((a,e)=>a+vol(e.sets||[]),0); });
  const mKeys=Object.keys(monthVol).sort().slice(-6);
  const maxMV=Math.max(1,...mKeys.map(k=>monthVol[k]));

  // Frequency by day type
  const dayCount = {};
  history.forEach(w=>{ dayCount[w.day]=(dayCount[w.day]||0)+1; });

  // e1rm history for selected exercise
  const exHistory = selEx ? history.flatMap(w=>(w.exercises||[]).filter(e=>e.name===selEx).flatMap(e=>(e.sets||[]).map(s=>({ date:w.date, val:e1rm(s.w,s.r) })))).sort((a,b)=>a.date<b.date?-1:1) : [];

  return (
    <div>
      {/* Plate Calculator */}
      <PlateCalculator/>

      {/* Summary stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
        {[["WORKOUTS",history.length,"#ef4444"],["EXERCISES",allNames.length,"#60a5fa"],["THIS MONTH",history.filter(w=>w.date&&w.date.slice(0,7)===TODAY.slice(0,7)).length,"#4ade80"]].map(([l,v,c])=>(
          <div key={l} style={{ background:"#111", border:"1px solid #1c1c1c", borderRadius:8, padding:"10px 8px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:26, fontWeight:900, color:c }}>{v}</div>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#444", letterSpacing:1.5 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Volume chart */}
      {mKeys.length>0 && (
        <div style={S.card}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, color:"#444", letterSpacing:2, marginBottom:10 }}>MONTHLY VOLUME (lbs)</div>
          {mKeys.map(mk=>{
            const pct=(monthVol[mk]/maxMV)*100;
            return (
              <div key={mk} style={{ marginBottom:7 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, color:"#666" }}>{mk}</span>
                  <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, color:"#ccc", fontWeight:700 }}>{Math.round(monthVol[mk]).toLocaleString()}</span>
                </div>
                <div style={{ background:"#1a1a1a", borderRadius:3, height:7, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius:3 }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Split breakdown */}
      {Object.keys(dayCount).length>0 && (
        <div style={S.card}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, color:"#444", letterSpacing:2, marginBottom:10 }}>SPLIT BREAKDOWN</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {Object.entries(dayCount).sort((a,b)=>b[1]-a[1]).map(([t,c])=>{
              const col=DAY_COLORS[t]||DAY_COLORS["Full Body"];
              return (
                <div key={t} style={{ background:col.dim, border:`1px solid ${col.bg}33`, borderRadius:7, padding:"8px 12px", flex:1, minWidth:60, textAlign:"center" }}>
                  <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:22, fontWeight:900, color:col.bg }}>{c}</div>
                  <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, color:col.light, letterSpacing:0.5 }}>{t}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PR table */}
      <div style={S.card}>
        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, color:"#444", letterSpacing:2, marginBottom:8 }}>🏆 PERSONAL RECORDS</div>
        <input value={filterEx} onChange={e=>setFilterEx(e.target.value)} placeholder="Filter exercises..." style={{ width:"100%", marginBottom:10, ...S.input, boxSizing:"border-box" }}/>
        {filtered.map(name=>{
          const pr=prMap[name];
          if(!pr)return null;
          return (
            <div key={name} onClick={()=>setSelEx(selEx===name?null:name)} style={{ background:selEx===name?"#181818":"#0d0d0d", border:"1px solid #1c1c1c", borderRadius:7, padding:"10px 12px", marginBottom:6, cursor:"pointer" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:600, color:"#fff", fontSize:13 }}>{name}</div>
                  <div style={{ color:"#555", fontSize:11 }}>{pr.weight} lbs × {pr.reps} reps · {pr.date}</div>
                </div>
                <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:22, color:"#fbbf24", fontWeight:900 }}>{pr.val}<span style={{ fontSize:11, color:"#666" }}> e1RM</span></div>
              </div>
              {selEx===name && exHistory.length>1 && (
                <div style={{ marginTop:10 }}>
                  <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, color:"#444", letterSpacing:2, marginBottom:6 }}>e1RM HISTORY</div>
                  {exHistory.map((p,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", color:"#666", fontSize:11, padding:"2px 0", borderBottom:"1px solid #161616" }}>
                      <span>{p.date}</span>
                      <span style={{ color: p.val===pr.val?"#fbbf24":"#888", fontWeight: p.val===pr.val?700:400 }}>{p.val} lbs</span>
                    </div>
                  ))}
                  {(data.exerciseNotes||{})[name] && (
                    <div style={{ background:"#120e00", border:"1px solid #78350f44", borderRadius:6, padding:"6px 10px", marginTop:8 }}>
                      <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#78350f", letterSpacing:2, marginBottom:2 }}>📌 YOUR NOTE</div>
                      <div style={{ color:"#d97706", fontSize:12 }}>{(data.exerciseNotes||{})[name]}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length===0&&<div style={{ color:"#444", fontSize:13, textAlign:"center", padding:20 }}>No exercises found.</div>}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("today");
  const [data, setData] = useState(()=>load());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  // Offline detection — all data saves to localStorage so nothing is ever lost
  useEffect(() => {
    const goOnline = () => { setIsOnline(true); };
    const goOffline = () => { setIsOnline(false); setWasOffline(true); };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  const persist = (next) => { setData(next); save(next); };

  // The PPL+FB rotation order — used for inference when no program is set
  const ROTATION = ["Push","Pull","Legs","Full Body"];

  const autoAdvance = (completedDayType, currentData) => {
    let nextDayType = null;

    // ── Strategy 1: Active program schedule ──────────────────────
    const prog = currentData.activeProgram ? PROGRAMS[currentData.activeProgram] : null;
    if (prog) {
      const schedule = prog.schedule;
      const completedIdx = schedule.findIndex(d => d === completedDayType);
      if (completedIdx !== -1) {
        for (let i = 1; i <= schedule.length; i++) {
          const idx = (completedIdx + i) % schedule.length;
          if (schedule[idx] !== "Rest") { nextDayType = schedule[idx]; break; }
        }
      }
    }

    // ── Strategy 2: Infer from history if no program / no match ──
    if (!nextDayType) {
      // Look at the last few workouts and find where we are in the rotation
      const recentDays = (currentData.history||[])
        .slice(-6)
        .map(w => w.day)
        .filter(d => ROTATION.includes(d));

      const lastInRotation = recentDays[recentDays.length - 1];
      const currentRotationIdx = ROTATION.indexOf(lastInRotation ?? completedDayType);
      nextDayType = ROTATION[(currentRotationIdx + 1) % ROTATION.length];
    }

    if (!nextDayType) return currentData;

    // ── Find next available calendar date ────────────────────────
    // Don't assign a specific date — just record what's next
    // so Today tab can show it and pre-load it immediately
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = ymd(tomorrow);

    const existingPlan = (currentData.calendar||{})[tomorrowStr];
    const alreadyLogged = (currentData.history||[]).some(h => h.date === tomorrowStr);

    const cal = { ...(currentData.calendar||{}) };
    if (!existingPlan && !alreadyLogged) {
      cal[tomorrowStr] = nextDayType;
    }

    return {
      ...currentData,
      calendar: cal,
      nextPlanned: { date: tomorrowStr, dayType: existingPlan || nextDayType },
      suggestedDay: nextDayType, // used by Today tab to pre-select the right day type
    };
  };

  const saveExNote = useCallback((exName, note) => {
    const notes = { ...(data.exerciseNotes||{}) };
    if (!note) delete notes[exName];
    else notes[exName] = note;
    persist({ ...data, exerciseNotes: notes });
  }, [data]);

  const setActiveProgram = useCallback((name) => {
    const next = name ? { ...data, activeProgram: name } : { ...data, activeProgram: null };
    persist(next);
  }, [data]);

  const saveWorkout = useCallback((w) => {
    const history = [...(data.history||[]).filter(x=>x.date!==w.date), w];
    const updated = autoAdvance(w.day, { ...data, history });
    persist(updated);
  }, [data]);

  const deleteWorkout = useCallback((idx) => {
    persist({ ...data, history:(data.history||[]).filter((_,i)=>i!==idx) });
  }, [data]);

  const planDay = useCallback((date, dayType) => {
    const cal = { ...(data.calendar||{}) };
    if (dayType === null) { delete cal[date]; }
    else { cal[date] = dayType; }
    persist({ ...data, calendar:cal });
  }, [data]);

  const history = data.history||[];
  const thisWeek = history.filter(w=>{ const d=new Date(w.date),n=new Date(); return (n-d)/(864e5)<7; }).length;

  // Streak: count consecutive weeks with 3+ workouts
  const streak = (() => {
    let s = 0;
    for (let w = 0; w < 52; w++) {
      const start = new Date(); start.setDate(start.getDate() - (w+1)*7);
      const end = new Date(); end.setDate(end.getDate() - w*7);
      const count = history.filter(x=>{ const d=new Date(x.date); return d>=start&&d<end; }).length;
      if (count >= 3) s++; else if (w > 0) break;
    }
    return s;
  })();

  const TABS = [
    { id:"today", icon:"⚡", label:"TODAY" },
    { id:"calendar", icon:"📅", label:"CALENDAR" },
    { id:"programs", icon:"📋", label:"PROGRAMS" },
    { id:"log", icon:"📖", label:"LOG" },
    { id:"gains", icon:"📈", label:"GAINS" },
  ];

  return (
    <div style={S.app}>
      <FontLink/>
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input[type=number]::-webkit-inner-spin-button { opacity:1; }
        select { appearance: none; -webkit-appearance: none; }
        @keyframes prPop { 0%{transform:scale(1.4);opacity:0} 100%{transform:scale(1);opacity:1} }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:#0d0d0d; } ::-webkit-scrollbar-thumb { background:#2a2a2a; border-radius:2px; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.title}>IRONLOG</div>
          <div style={S.subtitle}>PPL · FULL BODY · HOTEL</div>
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"baseline" }}>
          {streak > 0 && (
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:22, color:"#f97316", lineHeight:1 }}>🔥{streak}</div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, color:"#444", letterSpacing:1 }}>WK STREAK</div>
            </div>
          )}
          <div style={{ textAlign:"right" }}>
            <div style={S.statBig}>{thisWeek}<span style={{ color:"#333", fontSize:14 }}>/4</span></div>
            <div style={S.statLbl}>THIS WEEK</div>
          </div>
        </div>
      </div>

      {/* Offline banner */}
      {!isOnline && (
        <div style={{ background:"#1a0a00", borderBottom:"1px solid #d9770644", padding:"6px 16px", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:14 }}>📵</span>
          <div>
            <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, color:"#d97706", fontWeight:700, letterSpacing:1 }}>OFFLINE MODE</span>
            <span style={{ color:"#555", fontSize:11, marginLeft:8 }}>All data saving locally — nothing lost</span>
          </div>
        </div>
      )}
      {isOnline && wasOffline && (
        <div style={{ background:"#0a1a0a", borderBottom:"1px solid #4ade8044", padding:"6px 16px", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:14 }}>✅</span>
          <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, color:"#4ade80", fontWeight:700, letterSpacing:1 }}>BACK ONLINE</span>
        </div>
      )}

      {/* Content */}
      <div style={S.content}>
        {tab==="today"    && <TodayTab    data={data} onSave={saveWorkout} onSetProgram={setActiveProgram} onSaveExNote={saveExNote}/>}
        {tab==="calendar" && <CalendarTab data={data} onPlan={planDay}/>}
        {tab==="programs" && <ProgramsTab data={data} onPlan={planDay}/>}
        {tab==="log"      && <LogTab      data={data} onDelete={deleteWorkout}/>}
        {tab==="gains"    && <GainsTab    data={data}/>}
      </div>

      {/* Tab bar */}
      <div style={S.tabBar}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={S.tab(tab===t.id)}>
            <span style={{ fontSize:16 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
